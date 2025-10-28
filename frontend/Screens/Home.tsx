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
import authService from "../services/authService";
import API_CONFIG, { clearAuthData, getAuthData } from "../services/apiConfig";
import { getCaracteristicasTexto } from "../utils/formatters";
import { Pet } from "../types/types";
import axios from "axios";
import BottomNavigation from "../components/BottomNavigation";

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  // helper para resolver pet.imagem (string relativa) para { uri }
  const resolveImageSource = (petLike: any) => {
    const img = petLike?.imagem || petLike?.foto || null;
    if (!img) return null;
    if (typeof img === "string") {
      const root = API_CONFIG.BASE_URL.replace(/\/server\/?$/, "");
      const uri =
        img.startsWith("http") || img.startsWith("https")
          ? img
          : `${root}${img.startsWith("/") ? "" : "/"}${img}`;
      return { uri };
    }
    return img;
  };

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  useEffect(() => {
    // load pets when profile is ready
    if (userProfile) loadPets();
  }, [userProfile]);

  const checkAuthAndLoadProfile = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (!isLoggedIn) {
        router.replace("/login");
        return;
      }

      const profile = await authService.getUserProfile();
      // Se o usuário for ONG, não deve acessar a Home pública — redireciona para gerenciamento de pets
      if (profile?.tipo === "ONG") {
        router.replace("/manage-pets");
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      router.replace("/login");
    }
  };

  const goToLogin = async () => {
    try {
      await clearAuthData();
    } catch (err) {
      console.warn("Erro limpando AsyncStorage:", err);
    }
    router.replace("/login");
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Recarrega lista de pets
    (async () => {
      await loadPets();
      setRefreshing(false);
    })();
  }, []);

  const loadPets = async () => {
    try {
      const auth = await getAuthData();
      const access = auth.access;

      // usa a rota /server/get_compatible_pets conforme documentação
      const url = `${API_CONFIG.BASE_URL}/get_compatible_pets`;
      const adotanteId =
        // preferir o profile carregado no estado, senão usar o profile do storage
        (userProfile && (userProfile.id as any)) ||
        (auth.userProfile && (auth.userProfile.id as any)) ||
        null;

      const resp = await axios.post(
        url,
        { adotante_id: adotanteId }, // corpo esperado pelo backend
        {
          headers: {
            Authorization: access ? `Bearer ${access}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      const data = resp.data;
      setPets(data.pets || data || []);
    } catch (e) {
      console.error("Erro ao carregar pets na Home:", e);
      setPets([]);
    }
  };

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
      <View
        className="absolute top-4 left-0 right-0 px-4 flex-row items-center justify-between z-10"
        style={{
          // use the same background color as the main screen so the header blends in
          backgroundColor: "#F8F3EC",
          paddingVertical: 8,
          paddingHorizontal: 16,
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1000,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text className="text-xl font-bold text-pethelper-dark">
            Pets pra você
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            Encontramos {pets.length} {pets.length === 1 ? "pet" : "pets"} pra
            você!
          </Text>
        </View>
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
                paddingTop: 76,
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
              }
            : { padding: 16, paddingBottom: 120, paddingTop: 76 }
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
        {/* spacer to ensure content starts below the absolute header */}
        <View style={{ height: 28 }} />

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
            // obtém texto das características, remove duplicatas e filtra entradas inválidas
            const rawCaracteristicas = getCaracteristicasTexto(
              pet.vetor_caracteristicas
            );
            const caracteristicas = rawCaracteristicas
              .filter((c, i, arr) => arr.indexOf(c) === i)
              .filter((c) => {
                if (!c) return false;
                // normaliza e remove acentos para comparar
                const normalized = c
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .trim()
                  .toLowerCase();
                return normalized !== "caracteristica";
              });

            return (
              <View key={pet.id} className="pet-card">
                <View className="pet-image-container">
                  {resolveImageSource(pet) ? (
                    <Image
                      source={resolveImageSource(pet)}
                      className="pet-image"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="pet-image bg-gray-100" />
                  )}
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
