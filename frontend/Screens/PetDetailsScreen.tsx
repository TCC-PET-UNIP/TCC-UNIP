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
import { getPetById, getCaracteristicasTexto } from "../mockData/mockPets";
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
      const petData = getPetById(Number(id));
      setPet(petData || null);
    }

    // Carregar perfil do usuário para a navegação
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
        <Text className="text-lg text-white mb-5">Pet não encontrado</Text>
        <TouchableOpacity
          onPress={handleVoltar}
          className="bg-white px-5 py-2.5 rounded-lg"
        >
          <Text className="text-[#B87B56] text-base font-bold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const caracteristicas = getCaracteristicasTexto(pet.vetor_caracteristicas);

  return (
    <View className="flex-1 bg-[#B87B56]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header com título do pet */}
        <View className="flex-row items-center justify-between pt-16 pb-5 px-5 bg-[#B87B56]">
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

        {/* Imagem principal */}
        <View className="h-72 mx-5 rounded-xl overflow-hidden mb-4">
          <Image
            source={petImages[selectedImageIndex]}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Miniaturas das imagens */}
        <View className="flex-row justify-center px-5 mb-5 gap-2.5">
          {petImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              className={`w-15 h-15 rounded-lg overflow-hidden border-2 ${
                selectedImageIndex === index
                  ? "border-white"
                  : "border-transparent"
              }`}
              onPress={() => setSelectedImageIndex(index)}
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
        <View className="bg-white mx-5 rounded-2xl p-5 mb-5 shadow-lg">
          <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
            Informações do Pet
          </Text>

          <View className="gap-3">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-base text-gray-600 font-medium flex-1">
                Nome:
              </Text>
              <Text className="text-base text-gray-800 font-semibold flex-2 text-right">
                {pet?.nome}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-base text-gray-600 font-medium flex-1">
                Idade:
              </Text>
              <Text className="text-base text-gray-800 font-semibold flex-2 text-right">
                {pet?.idade} {pet?.idade === 1 ? "ano" : "anos"}
              </Text>
            </View>

            {pet?.raca && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-base text-gray-600 font-medium flex-1">
                  Raça:
                </Text>
                <Text className="text-base text-gray-800 font-semibold flex-2 text-right">
                  {pet.raca}
                </Text>
              </View>
            )}

            {pet?.sexo && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-base text-gray-600 font-medium flex-1">
                  Sexo:
                </Text>
                <Text className="text-base text-gray-800 font-semibold flex-2 text-right">
                  {pet.sexo}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-base text-gray-600 font-medium flex-1">
                Condição de Saúde:
              </Text>
              <Text className="text-base text-gray-800 font-semibold flex-2 text-right">
                {pet?.vacinado
                  ? "Saudável, vacinas em dia"
                  : "Necessita cuidados"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-base text-gray-600 font-medium flex-1">
                Castrado:
              </Text>
              <Text className="text-base text-gray-800 font-semibold flex-2 text-right">
                {pet?.castrado ? "Sim" : "Não"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-base text-gray-600 font-medium flex-1">
                Comportamento:
              </Text>
              <Text className="text-base text-gray-800 font-semibold flex-2 text-right">
                Sociável com crianças e outros
              </Text>
            </View>

            <View className="py-3 border-b border-gray-100">
              <Text className="text-base text-gray-600 font-medium flex-1">
                Descrição:
              </Text>
              <Text className="text-sm text-gray-800 leading-6 mt-2 text-justify">
                {pet?.descricao || "Informações não disponíveis"}
              </Text>
            </View>
          </View>
        </View>

        {/* Card da clínica */}
        <View className="bg-white mx-5 rounded-2xl p-5 mb-5 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-lg font-bold text-gray-800 mb-1">
                Clínica Vida Animal
              </Text>
              <Text className="text-sm text-gray-600">
                Rua das Flores, 123, Centro
              </Text>
            </View>
            <View className="w-15 h-15 bg-gray-100 rounded-lg justify-center items-center">
              <Image
                source={require("@/assets/images/Dog_Login.png")}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>
          </View>

          <TouchableOpacity className="bg-[#8DC6CE] py-3 rounded-lg items-center">
            <Text className="text-white text-base font-bold">Ver Mais</Text>
          </TouchableOpacity>
        </View>

        {/* Espaço para navegação inferior */}
        <View className="h-25" />
      </ScrollView>

      {/* Navegação inferior */}
      <BottomNavigation userType={userProfile?.tipo} />
    </View>
  );
}
