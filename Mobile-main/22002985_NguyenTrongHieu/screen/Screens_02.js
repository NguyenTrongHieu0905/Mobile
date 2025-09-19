import React, { useState, useEffect, useCallback } from 'react';
import {View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';

class Medicine {
  constructor(id, name, price, star, description, image) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.star = star;
    this.description = description;
    this.image = image; // link ảnh online từ MockAPI
  }
}

const Screen_02 = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://68cd09cdda4697a7f304859f.mockapi.io/medicines';

  // Fetch data từ MockAPI (dùng useCallback)
  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      // Chuyển data thành object theo class Medicine
      const medicineObjects = data.map(
        (item) =>
          new Medicine(item.id, item.name, item.price, item.star, item.description, item.image)
      );

      setMedicines(medicineObjects);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      Alert.alert('Error', 'Không thể tải dữ liệu từ API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Xử lý khi chọn sản phẩm
  const handlePress = (item) => {
    Alert.alert('Medicine Selected', `Bạn đã chọn: ${item.name}`);
  };

  // Render 1 item
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>💲 {item.price}</Text>
        <Text style={styles.star}>⭐ {item.star}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.readMore}>Read More...</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Screen 02 - MockAPI</Text>
        <Text style={styles.bannerText}>Fetch data + OOP + useCallback</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchMedicines}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
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
  banner: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerText: { color: '#fff', fontSize: 12, marginBottom: 10 },
  refreshBtn: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  refreshText: { color: '#1a73e8', fontWeight: 'bold' },
  list: { padding: 10 },
  card: {
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    flex: 0.48, // 2 cột
    elevation: 2,
  },
  image: { width: '100%', height: 120, borderRadius: 8, marginBottom: 5 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  price: { fontSize: 14, color: '#1a73e8', fontWeight: '600' },
  star: { fontSize: 14, color: '#f1c40f' },
  description: { fontSize: 12, color: '#666' },
  readMore: { color: '#1a73e8', marginTop: 5, fontSize: 12 },
});

export default Screen_02;
