import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { shoeService } from "../components/shoeService";

const ShoeListScreen = ({ navigation }) => {
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lấy danh sách sản phẩm
  const fetchShoes = async () => {
    try {
      setLoading(true);
      const response = await shoeService.getAllShoes();
      if (response.status === 200) setShoes(response.data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động refresh khi quay lại màn hình chính
  useFocusEffect(
    useCallback(() => {
      fetchShoes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchShoes();
  };

  // Xóa sản phẩm
  const handleDeleteShoe = async (id, name) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa "${name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await shoeService.deleteShoe(id);
              if (response.status === 200) {
                Alert.alert("Thành công", "Đã xóa sản phẩm!");
                fetchShoes();
              }
            } catch {
              Alert.alert("Lỗi", "Không thể xóa sản phẩm!");
            }
          },
        },
      ]
    );
  };

  const renderShoeItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.tenSanPham}</Text>
        <Text style={styles.text}>Mã: {item.maSanPham}</Text>
        <Text style={styles.text}>Giá: {item.giaSanPham} VNĐ</Text>
        <Text style={styles.text}>Size: {item.size}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditShoe", { shoe: item })}
        >
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteShoe(item.id, item.tenSanPham)}
        >
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DANH SÁCH GIÀY</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddShoe")}
        >
          <Text style={styles.addButtonText}>+ Thêm mới</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={shoes}
        renderItem={renderShoeItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default ShoeListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: "white", fontWeight: "bold" },
  card: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  name: { fontSize: 16, fontWeight: "bold", color: "#000" },
  text: { fontSize: 14, color: "#555" },
  actions: { justifyContent: "space-between" },
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 6,
    borderRadius: 6,
  },
  actionText: { color: "#fff", fontWeight: "bold" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
