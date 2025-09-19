import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput, ActivityIndicator } from 'react-native';
import mongoConfig from '../config/mongoConfig';
import { mongoDeleteOne, mongoFind, mongoInsertOne, toObjectId } from '../services/mongoService';

// Screen_04: MongoDB local json quản lý data + useCallback/useMemo
// Ở môi trường RN, ta mô phỏng "Mongo local" bằng 1 JSON trong dự án (assets) và lưu thay đổi trong state.
// Gợi ý mở rộng: có thể dùng AsyncStorage/realm/watermelon để lưu cục bộ.

const initialData = [
  {
    id: 'l1',
    name: 'Local Amoxicillin',
    price: '12.50',
    star: '4.6',
    description: 'Local JSON seed data',
    image: 'https://picsum.photos/200?seed=1',
  },
  {
    id: 'l2',
    name: 'Local Paracetamol',
    price: '8.90',
    star: '4.7',
    description: 'Managed in-memory like Mongo local',
    image: 'https://picsum.photos/200?seed=2',
  },
];

const Screen_04 = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  const loadLocal = useCallback(async () => {
    setDocs(initialData);
  }, []);

  const loadMongo = useCallback(async () => {
    setLoading(true);
    try {
      const result = await mongoFind({}, 100);
      const mapped = result.map((d) => ({
        id: typeof d._id === 'object' && d._id.$oid ? d._id.$oid : d._id || String(Math.random()),
        name: d.name,
        price: d.price,
        star: d.star,
        description: d.description,
        image: d.image,
      }));
      setDocs(mapped);
    } catch (e) {
      await loadLocal();
    } finally {
      setLoading(false);
    }
  }, [loadLocal]);

  useEffect(() => {
    if (mongoConfig.enabled) {
      loadMongo();
    } else {
      loadLocal();
    }
  }, [loadLocal, loadMongo]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return docs;
    return docs.filter((d) => (d.name || '').toLowerCase().includes(k) || (d.description || '').toLowerCase().includes(k));
  }, [docs, q]);

  const addDoc = useCallback(async () => {
    const newDoc = {
      name: 'Local Item ' + Math.floor(Math.random() * 1000),
      price: (Math.random() * 50).toFixed(2),
      star: (3 + Math.random() * 2).toFixed(1),
      description: 'Added from Screen_04',
      image: 'https://picsum.photos/200?random=' + Math.floor(Math.random() * 1000),
    };
    if (mongoConfig.enabled) {
      try {
        setLoading(true);
        await mongoInsertOne(newDoc);
        await loadMongo();
      } catch (e) {
        Alert.alert('Mongo', 'Thêm thất bại, dùng local');
        setDocs((prev) => [{ id: 'l' + Math.random(), ...newDoc }, ...prev]);
      } finally {
        setLoading(false);
      }
    } else {
      setDocs((prev) => [{ id: 'l' + Math.random(), ...newDoc }, ...prev]);
    }
  }, [loadMongo]);

  const removeDoc = useCallback(async (id) => {
    if (mongoConfig.enabled) {
      try {
        setLoading(true);
        await mongoDeleteOne({ _id: toObjectId(id) });
        await loadMongo();
      } catch (e) {
        Alert.alert('Mongo', 'Xóa thất bại, xóa local');
        setDocs((prev) => prev.filter((d) => d.id !== id));
      } finally {
        setLoading(false);
      }
    } else {
      setDocs((prev) => prev.filter((d) => d.id !== id));
    }
  }, [loadMongo]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onLongPress={() => removeDoc(item.id)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>💲 {item.price}</Text>
        <Text style={styles.star}>⭐ {item.star}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.smallNote}>Giữ lâu để xóa (local)</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Screen 04 - Local JSON (Mongo-like)</Text>
        <Text style={styles.bannerText}>useCallback + useMemo, quản lý dữ liệu cục bộ</Text>
        <View style={styles.bannerRow}>
          <TouchableOpacity style={styles.btn} onPress={loadLocal}>
            <Text style={styles.btnText}>⟳ Nạp lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={addDoc}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>＋ Thêm</Text>
          </TouchableOpacity>
        </View>
        <TextInput value={q} onChangeText={setQ} placeholder="Tìm kiếm..." style={styles.search} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(it) => String(it.id)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  banner: { backgroundColor: '#1a73e8', padding: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 10 },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerText: { color: '#fff', fontSize: 12, marginBottom: 10 },
  bannerRow: { flexDirection: 'row', gap: 10 },
  btn: { backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
  btnSecondary: { backgroundColor: '#e8f0fe', marginLeft: 8 },
  btnText: { color: '#1a73e8', fontWeight: 'bold' },
  btnTextSecondary: { color: '#1a73e8' },
  search: { marginTop: 10, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  list: { padding: 10 },
  card: { backgroundColor: '#f5f5f5', marginBottom: 12, padding: 10, borderRadius: 10, flex: 0.48, elevation: 2 },
  image: { width: '100%', height: 120, borderRadius: 8, marginBottom: 5 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  price: { fontSize: 14, color: '#1a73e8', fontWeight: '600' },
  star: { fontSize: 14, color: '#f1c40f' },
  description: { fontSize: 12, color: '#666' },
  smallNote: { fontSize: 10, color: '#777', marginTop: 4 },
});

export default Screen_04;


