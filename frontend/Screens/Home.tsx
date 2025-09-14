import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../services/authService";
import { mockPets, getCaracteristicasTexto } from "../mockData/mockPets";
import { Pet } from "../types/types";
import BottomNavigation from "../components/BottomNavigation";

export default function Home() {
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (!isLoggedIn) {
        router.replace("/login");
        return;
      }

      const profile = await authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      router.replace("/login");
    }
  };

  const goToLogin = async () => {
    try {
      await AsyncStorage.clear();
    } catch (err) {
      console.warn("Erro limpando AsyncStorage:", err);
    }
    router.replace("/login");
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      const shuffledPets = [...mockPets].sort(() => Math.random() - 0.5);
      setPets(shuffledPets);
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleVerMais = (petId: number) => {
    router.push(`/pet-details/${petId}` as any);
  };

  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-orange-50">
        <Text className="text-lg text-amber-700">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-orange-50">
      {/* Header */}
      <View className="flex-row justify-between items-center pt-16 pb-5 px-5 bg-orange-50">
        <Text className="text-xl font-bold text-gray-800 flex-1">
          Pets pra você
        </Text>
        <TouchableOpacity className="p-2 rounded-lg" onPress={goToLogin}>
          <Feather name="log-out" size={20} color="#ad3434" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8DC6CE"]}
            tintColor="#8DC6CE"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {pets.map((pet) => {
          const caracteristicas = getCaracteristicasTexto(
            pet.vetor_caracteristicas
          );

          return (
            <View
              key={pet.id}
              className="bg-amber-700 rounded-2xl mb-5 p-4 shadow-lg"
            >
              <View className="rounded-2xl overflow-hidden mb-4 h-72">
                <Image
                  source={pet.foto}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              <View className="flex-1">
                <Text className="text-3xl font-bold text-white mb-3">
                  {pet.nome}
                </Text>

                <View className="mb-5">
                  <Text className="text-lg font-bold text-white mb-2">
                    Características
                  </Text>
                  <View className="gap-1">
                    {caracteristicas.map((caracteristica, index) => (
                      <View key={index} className="mb-1">
                        <Text className="text-base text-white leading-6">
                          • {caracteristica}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-teal-400 py-4 px-6 rounded-xl items-center mt-1"
                  onPress={() => handleVerMais(pet.id)}
                >
                  <Text className="text-white text-base font-bold">
                    Ver Mais
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Navegação inferior */}
      <BottomNavigation userType={userProfile?.tipo} />
    </View>
  );
}
