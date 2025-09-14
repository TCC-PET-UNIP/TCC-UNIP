import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import authService from "../services/authService";
import { UserProfile } from "../types/types";

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Confirmar", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#B87B56] items-center justify-center">
        <Text className="text-white text-lg">Carregando...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View className="flex-1 bg-[#B87B56] items-center justify-center">
        <Text className="text-white text-lg">Erro ao carregar perfil</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#B87B56]">
      <View className="items-center px-4 pt-16 pb-8">
        {/* Header com foto e informações básicas */}
        <View className="w-full max-w-[400px] bg-[#F8F3EC] rounded-3xl p-6 mb-6 items-center shadow-lg">
          <View className="w-32 h-32 rounded-full bg-[#8DC6CE] items-center justify-center mb-4 overflow-hidden border-4 border-[#8DC6CE]">
            <Image
              source={require("@/assets/images/Dog_Login.png")}
              className="w-28 h-28"
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-bold text-[#ad3434] mb-2 text-center">
            Bem-vindo(a)!
          </Text>

          <Text className="text-xl font-bold text-[#B87B56] mb-1 text-center">
            {userProfile.tipo === "ADOTANTE"
              ? userProfile.nome
              : userProfile.nome_fantasia}
          </Text>

          <Text className="text-sm text-[#B87B56] mb-4 text-center">
            {userProfile.email}
          </Text>

          <View className="bg-[#8DC6CE] px-4 py-2 rounded-full">
            <Text className="text-white font-bold">
              {userProfile.tipo === "ADOTANTE" ? "Adotante" : "ONG"}
            </Text>
          </View>
        </View>

        {/* Informações detalhadas */}
        <View className="w-full max-w-[400px] bg-[#F8F3EC] rounded-3xl p-6 mb-6 shadow-lg">
          <Text className="text-lg font-bold text-[#ad3434] mb-4 text-center">
            Informações do Perfil
          </Text>

          {userProfile.tipo === "ADOTANTE" && (
            <View className="mb-3">
              <Text className="text-[#B87B56] font-bold">Idade:</Text>
              <Text className="text-[#B87B56]">{userProfile.idade} anos</Text>
            </View>
          )}

          {userProfile.tipo === "ONG" && (
            <View className="mb-3">
              <Text className="text-[#B87B56] font-bold">CNPJ:</Text>
              <Text className="text-[#B87B56]">{userProfile.cnpj}</Text>
            </View>
          )}

          <View className="mb-3">
            <Text className="text-[#B87B56] font-bold">Telefone:</Text>
            <Text className="text-[#B87B56]">{userProfile.telefone}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-[#B87B56] font-bold">Endereço:</Text>
            <Text className="text-[#B87B56]">
              {userProfile.endereco.logradouro}, {userProfile.endereco.numero}
            </Text>
            <Text className="text-[#B87B56]">
              {userProfile.endereco.bairro} - {userProfile.endereco.cidade}/
              {userProfile.endereco.uf}
            </Text>
            <Text className="text-[#B87B56]">
              CEP: {userProfile.endereco.cep}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-[#B87B56] font-bold">Membro desde:</Text>
            <Text className="text-[#B87B56]">
              {new Date(userProfile.data_cadastro).toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>

        {/* Botões de ação */}
        <View className="w-full max-w-[400px] space-y-4">
          {userProfile.tipo === "ADOTANTE" && (
            <TouchableOpacity
              className="w-full bg-[#8DC6CE] rounded-lg py-4 mb-3"
              onPress={() => router.push("/home")}
            >
              <Text className="text-white text-center font-bold text-base">
                BUSCAR PETS
              </Text>
            </TouchableOpacity>
          )}

          {userProfile.tipo === "ONG" && (
            <TouchableOpacity className="w-full bg-[#8DC6CE] rounded-lg py-4 mb-3">
              <Text className="text-white text-center font-bold text-base">
                GERENCIAR PETS
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleLogout}
            className="w-full bg-[#ad3434] rounded-lg py-4"
          >
            <Text className="text-white text-center font-bold text-base">
              SAIR
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-white font-bold text-center pb-8">TCC - UNIP</Text>
    </ScrollView>
  );
}
