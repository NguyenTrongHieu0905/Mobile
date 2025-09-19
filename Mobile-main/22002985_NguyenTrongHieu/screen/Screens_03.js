import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, TextInput } from 'react-native';

// Screen_03: useCallback + useMemo, nâng cấp đồng bộ API (CRUD cơ bản + filter memoized)

const API_URL = 'https://68cd09cdda4697a7f304859f.mockapi.io/medicines';

const Screen_03 = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // useMemo để tối ưu filter theo keyword
  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      (it.name || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q)
    );
  }, [items, keyword]);

  const addRandom = useCallback(async () => {
    try {
      setLoading(true);
      const body = {
        name: 'New Item ' + Math.floor(Math.random() * 1000),
        price: (Math.random() * 100).toFixed(2),
        star: (3 + Math.random() * 2).toFixed(1),
        description: 'Auto created from Screen_03',
        image: 'https://picsum.photos/200?random=' + Math.floor(Math.random() * 1000),
      };
      const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Create failed');
      await fetchItems();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [fetchItems]);

  const removeItem = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      Alert.alert('Lỗi', 'Xóa thất bại');
    } finally {
      setLoading(false);
    }
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onLongPress={() => removeItem(item.id)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>💲 {item.price}</Text>
        <Text style={styles.star}>⭐ {item.star}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.smallNote}>Giữ lâu để xóa</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Screen 03 - useCallback + useMemo</Text>
        <Text style={styles.bannerText}>Nâng cấp đồng bộ API (CRUD + filter)</Text>
        <View style={styles.bannerRow}>
          <TouchableOpacity style={styles.btn} onPress={fetchItems}>
            <Text style={styles.btnText}>↻ Tải lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={addRandom}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>＋ Thêm</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="Tìm kiếm..."
          value={keyword}
          onChangeText={setKeyword}
          style={styles.search}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
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

export default Screen_03;


