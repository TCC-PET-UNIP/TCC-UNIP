import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockUsers } from "../mockData/mockUsers";

export default function Home() {
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <View className="flex-row items-center bg-white rounded-lg p-3 mb-3 shadow">
      <Image
        source={{ uri: item.avatar }}
        className="w-14 h-14 rounded-full mr-3"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-base font-bold text-[#2b2b2b]">{item.name}</Text>
        <Text className="text-sm text-[#6b6b6b]">
          {item.role} • {item.city}, {item.state}
        </Text>
      </View>
      <View
        className={`px-3 py-1 rounded-full ${
          item.role === "ONG" ? "bg-[#8DC6CE]" : "bg-[#B87B56]"
        }`}
      >
        <Text className="text-white text-xs font-bold">{item.role}</Text>
      </View>
    </View>
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
    } catch (e) {
      // ignore
    } finally {
      router.replace("/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F3EC]">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F3EC" />
      <View className="px-6 pt-6 pb-3 bg-[#B87B56] rounded-b-3xl">
        <Text className="text-white text-2xl font-bold">PetHelper</Text>
        <Text className="text-white/90 mt-1">
          Bem-vindo(a)! Aqui estão alguns perfis:
        </Text>
      </View>

      <View className="flex-1 px-6 mt-6">
        <FlatList
          data={mockUsers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text className="text-center text-[#6b6b6b] mt-8">
              Nenhum usuário encontrado.
            </Text>
          }
        />
      </View>

      <View className="px-6 mb-8">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-[#8DC6CE] rounded-lg py-3"
        >
          <Text className="text-center text-white font-bold">
            Sair / Voltar ao Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
