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
import { getCaracteristicasTexto } from "../mockData/mockPets";
import { Pet } from "../types/types";
import BottomNavigation from "../components/BottomNavigation";

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
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
    // TODO: Buscar pets do backend
    setTimeout(() => {
      // Por enquanto, apenas reseta o estado de refreshing
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleVerMais = (petId: number) => {
    router.push(`/pet-details/${petId}` as any);
  };

  if (!userProfile) {
    return (
      <View className="loading-container">
        <Text className="loading-text">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="container-pethelper">
      {/* Header - posicionado mais para cima */}
      <View className="absolute top-4 left-0 right-0 px-4 flex-row items-center justify-between z-10">
        <Text className="text-xl font-bold text-pethelper-dark">
          Pets pra você
        </Text>
        <TouchableOpacity className="btn-pethelper-logout" onPress={goToLogin}>
          <Feather name="log-out" size={20} color="#ad3434" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="content-pethelper"
        contentContainerStyle={
          pets.length === 0
            ? {
                padding: 16,
                paddingBottom: 120,
                paddingTop: 88,
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
              }
            : { padding: 16, paddingBottom: 120, paddingTop: 88 }
        }
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
        {pets.length === 0 ? (
          <View className="flex items-center justify-center py-16">
            <Feather name="inbox" size={64} color="#B8B8B8" />
            <Text className="text-center text-gray-500 mt-4 text-lg">
              Nenhum pet disponível no momento
            </Text>
            <Text className="text-center text-gray-400 mt-2">
              Novos pets serão adicionados em breve!
            </Text>
          </View>
        ) : (
          pets.map((pet) => {
            const caracteristicas = getCaracteristicasTexto(
              pet.vetor_caracteristicas
            );

            return (
              <View key={pet.id} className="pet-card">
                <View className="pet-image-container">
                  <Image
                    source={pet.foto}
                    className="pet-image"
                    resizeMode="cover"
                  />
                </View>

                <View className="flex-1">
                  <Text className="pet-title">{pet.nome}</Text>

                  <View className="characteristics-container">
                    <Text className="pet-section-title">Características</Text>
                    <View className="characteristics-list">
                      {caracteristicas.map((caracteristica, index) => (
                        <View key={index} className="characteristic-item">
                          <Text className="pet-characteristic">
                            • {caracteristica}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    className="btn-pethelper-primary mt-1"
                    onPress={() => handleVerMais(pet.id)}
                  >
                    <Text className="btn-pethelper-text">Ver Mais</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Navegação inferior */}
      <BottomNavigation userType={userProfile?.tipo} />
    </View>
  );
}
