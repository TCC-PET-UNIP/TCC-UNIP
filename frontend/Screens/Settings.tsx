import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "../services/authService";
import BottomNavigation from "../components/BottomNavigation";
import { UserProfile } from "../types/types";

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (!isLoggedIn) {
        router.replace("/login");
        return;
      }

      const profile = await authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar as configurações.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace("/login");
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Não foi possível sair da conta.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      "Limpar cache",
      "Isso irá remover dados temporários do aplicativo. Deseja continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          onPress: () => {
            Alert.alert("Sucesso", "Cache limpo com sucesso!");
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    router.push("/about-app" as any);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-orange-50">
        <ActivityIndicator size="large" color="#8DC6CE" />
        <Text className="text-lg text-amber-700 mt-4">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-orange-50">
      {/* Header */}
      <View className="pt-8 pb-5 px-5 bg-orange-50 border-b border-amber-700/20">
        <Text className="text-2xl font-bold text-gray-800">Configurações</Text>
        {userProfile && (
          <Text className="text-sm text-gray-600 mt-1">
            {userProfile.tipo === "ONG"
              ? userProfile.nome_fantasia
              : userProfile.nome}
          </Text>
        )}
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção: Conta */}
        <View className="mt-6 px-5">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Conta
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 shadow-sm"
            onPress={() => router.push("/profile")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-orange-100 p-2.5 rounded-lg mr-3">
                <Feather name="user" size={20} color="#B87B56" />
              </View>
              <Text className="text-base text-gray-800 font-medium">
                Editar Perfil
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-xl p-4 shadow-sm"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-red-100 p-2.5 rounded-lg mr-3">
                <Feather name="log-out" size={20} color="#EF4444" />
              </View>
              <Text className="text-base text-red-600 font-medium">
                Sair da conta
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Seção: Outros */}
        <View className="mt-8 px-5">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Outros
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 shadow-sm"
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-orange-100 p-2.5 rounded-lg mr-3">
                <Feather name="trash-2" size={20} color="#B87B56" />
              </View>
              <Text className="text-base text-gray-800 font-medium">
                Limpar Cache
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-xl p-4 shadow-sm"
            onPress={handleAbout}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-orange-100 p-2.5 rounded-lg mr-3">
                <Feather name="info" size={20} color="#B87B56" />
              </View>
              <Text className="text-base text-gray-800 font-medium">
                Sobre o App
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Versão */}
        <View className="mt-8 mb-4 items-center">
          <Text className="text-xs text-gray-400">Versão 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation userType={userProfile?.tipo} />
    </View>
  );
}
