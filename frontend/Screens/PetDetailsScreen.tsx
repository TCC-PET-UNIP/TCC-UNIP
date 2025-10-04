import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import {
  getPetById,
  getCaracteristicasTexto,
  mockPets,
} from "../mockData/mockPets";
import { Pet } from "../types/types";
import BottomNavigation from "../components/BottomNavigation";
import authService from "../services/authService";

export default function PetDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mock de múltiplas imagens para o pet (usando a mesma imagem)
  const petImages = pet ? [pet.foto, pet.foto, pet.foto] : [];

  useEffect(() => {
    if (id) {
      const numericId = Number(id);
      const petData = getPetById(numericId);
      setPet(petData || null);
    }
    loadUserProfile();
  }, [id]);

  const loadUserProfile = async () => {
    try {
      const profile = await authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const handleAgendarVisita = () => {
    if (!pet) return;

    Alert.alert(
      "Agendar Visita",
      `Gostaria de agendar uma visita para conhecer ${pet.nome}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Ligar para ONG",
          onPress: () => {
            if (pet.ong_telefone) {
              Linking.openURL(`tel:${pet.ong_telefone.replace(/\D/g, "")}`);
            }
          },
        },
        {
          text: "WhatsApp",
          onPress: () => {
            if (pet.ong_telefone) {
              const phoneNumber = pet.ong_telefone.replace(/\D/g, "");
              const message = `Olá! Gostaria de agendar uma visita para conhecer ${pet.nome}.`;
              Linking.openURL(
                `whatsapp://send?phone=55${phoneNumber}&text=${encodeURIComponent(message)}`
              );
            }
          },
        },
      ]
    );
  };

  const handleVoltar = () => {
    router.back();
  };

  if (!pet) {
    return (
      <View className="flex-1 justify-center items-center bg-[#B87B56]">
        <Text className="text-lg text-white mb-5">
          Pet não encontrado (ID: {id})
        </Text>
        <TouchableOpacity
          onPress={handleVoltar}
          className="bg-white px-5 py-2.5 rounded-lg"
        >
          <Text className="text-[#B87B56] text-base font-bold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const caracteristicas = pet
    ? getCaracteristicasTexto(pet.vetor_caracteristicas)
    : [];

  return (
    <View className="flex-1 bg-amber-700">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row items-center justify-between pt-16 pb-5 px-5">
          <TouchableOpacity
            onPress={handleVoltar}
            className="p-2 rounded-xl bg-white/20"
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1 text-center mx-5">
            {pet?.nome || "Pet"}
          </Text>
          <View className="w-10" />
        </View>

        <View className="mx-5 mb-4">
          <View className="h-72 rounded-xl overflow-hidden">
            <Image
              source={petImages[selectedImageIndex]}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Miniaturas das imagens */}
        <View className="flex-row justify-center px-5 mb-8 space-x-3">
          {petImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImageIndex(index)}
              className="p-1 w-20 h-20 rounded-lg overflow-hidden"
              style={{
                borderWidth: selectedImageIndex === index ? 2 : 0,
                borderColor:
                  selectedImageIndex === index ? "#FFFFFF" : "transparent",
              }}
            >
              <Image
                source={image}
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Card de informações do pet */}
        <View className="mx-5 mb-5">
          <View className="bg-white rounded-xl p-5 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              Informações do Pet
            </Text>

            {/* Nome */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-base text-gray-600 font-medium">
                  Nome:
                </Text>
                <Text className="text-base text-gray-800 font-semibold">
                  {pet?.nome}
                </Text>
              </View>
            </View>

            {/* Idade */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-base text-gray-600 font-medium">
                  Idade:
                </Text>
                <Text className="text-base text-gray-800 font-semibold">
                  {pet?.idade} {pet?.idade === 1 ? "ano" : "anos"}
                </Text>
              </View>
            </View>

            {/* Raça */}
            {pet?.raca && (
              <View className="mb-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-base text-gray-600 font-medium">
                    Raça:
                  </Text>
                  <Text className="text-base text-gray-800 font-semibold">
                    {pet.raca}
                  </Text>
                </View>
              </View>
            )}

            {/* Sexo */}
            {pet?.sexo && (
              <View className="mb-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-base text-gray-600 font-medium">
                    Sexo:
                  </Text>
                  <Text className="text-base text-gray-800 font-semibold">
                    {pet.sexo}
                  </Text>
                </View>
              </View>
            )}

            {/* Peso */}
            {pet?.peso && (
              <View className="mb-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-base text-gray-600 font-medium">
                    Peso:
                  </Text>
                  <Text className="text-base text-gray-800 font-semibold">
                    {pet.peso}
                  </Text>
                </View>
              </View>
            )}

            {/* Saúde */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-base text-gray-600 font-medium">
                  Vacinado:
                </Text>
                <Text className="text-base text-gray-800 font-semibold">
                  {pet?.vacinado ? "Sim" : "Não"}
                </Text>
              </View>
            </View>

            {/* Castrado */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-base text-gray-600 font-medium">
                  Castrado:
                </Text>
                <Text className="text-base text-gray-800 font-semibold">
                  {pet?.castrado ? "Sim" : "Não"}
                </Text>
              </View>
            </View>

            {/* Características */}
            {caracteristicas.length > 0 && (
              <View className="mb-3">
                <View className="py-2 border-b border-gray-200">
                  <Text className="text-base text-gray-600 font-medium mb-2">
                    Características:
                  </Text>
                  <View className="flex-row flex-wrap">
                    {caracteristicas.map((caracteristica, index) => (
                      <View
                        key={index}
                        className="bg-teal-100 rounded-full px-3 py-1 mr-2 mb-2"
                      >
                        <Text className="text-sm text-teal-700">
                          {caracteristica}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Descrição */}
            {pet?.descricao && (
              <View className="mb-3">
                <View className="py-2">
                  <Text className="text-base text-gray-600 font-medium mb-2">
                    Descrição:
                  </Text>
                  <Text className="text-sm text-gray-700 leading-5 text-justify">
                    {pet.descricao}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Card da ONG */}
        <View className="mx-5 mb-5">
          <View className="bg-white rounded-xl p-5 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-bold text-gray-800 mb-1">
                  {pet?.ong_nome || "ONG Responsável"}
                </Text>
                {pet?.ong_endereco && (
                  <Text className="text-sm text-gray-600 mb-2 leading-5">
                    {pet.ong_endereco}
                  </Text>
                )}
                {pet?.ong_telefone && (
                  <Text className="text-sm text-gray-600">
                    📞 {pet.ong_telefone}
                  </Text>
                )}
              </View>
              <View className="w-16 h-16 bg-gray-100 rounded-lg justify-center items-center overflow-hidden">
                {pet?.ong_foto ? (
                  <Image
                    source={pet.ong_foto}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name="heart" size={24} color="#8DC6CE" />
                )}
              </View>
            </View>

            <TouchableOpacity
              className="bg-teal-400 py-3 rounded-lg items-center"
              onPress={handleAgendarVisita}
            >
              <Text className="text-white text-base font-bold">
                Entrar em Contato
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Navegação inferior */}
      <BottomNavigation userType={userProfile?.tipo} />
    </View>
  );
}
