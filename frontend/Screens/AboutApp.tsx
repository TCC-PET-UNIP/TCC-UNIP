import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

export default function AboutApp() {
  const router = useRouter();

  const developers = [
    {
      name: "Diego Ramos dos Santos",
      role: "Full Stack Developer",
      icon: "code",
    },
    {
      name: "Carlos Eduardo Lima",
      role: "Mobile Developer",
      icon: "smartphone",
    },
    {
      name: "Mariana Costa Silva",
      role: "UI/UX Designer",
      icon: "layout",
    },
    {
      name: "Rafael Oliveira",
      role: "Backend Developer",
      icon: "database",
    },
    {
      name: "Juliana Mendes",
      role: "Product Owner",
      icon: "briefcase",
    },
  ];

  const handleOpenGithub = async () => {
    const githubUrl = "https://github.com/TCC-PET-UNIP/TCC-UNIP";
    try {
      const supported = await Linking.canOpenURL(githubUrl);
      if (supported) {
        await Linking.openURL(githubUrl);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o link do GitHub.");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao tentar abrir o link.");
    }
  };

  return (
    <View className="flex-1 bg-orange-50">
      {/* Header */}
      <View className="flex-row items-center pt-10 pb-5 px-5 bg-orange-50 border-b border-amber-700/20">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#B87B56" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Sobre o App</Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <View className="mt-6 px-5">
          <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <View className="items-center mb-4">
              <View className="bg-orange-100 p-4 rounded-full mb-3">
                <Feather name="heart" size={40} color="#B87B56" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">TCC-PET</Text>
              <Text className="text-sm text-gray-500 mt-1">Versão 1.0.0</Text>
            </View>
            <Text className="text-center text-gray-600 leading-6">
              Aplicativo de adoção de pets desenvolvido para conectar ONGs e
              adotantes, facilitando o processo de adoção responsável de
              animais.
            </Text>
          </View>

          {/* Desenvolvedores */}
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Equipe de Desenvolvimento
          </Text>

          {developers.map((dev, index) => (
            <View
              key={index}
              className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm"
            >
              <View className="bg-orange-100 p-3 rounded-lg mr-4">
                <Feather name={dev.icon as any} size={24} color="#B87B56" />
              </View>
              <View className="flex-1">
                <Text className="text-base text-gray-800 font-semibold">
                  {dev.name}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">{dev.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* GitHub Link */}
        <View className="mt-6 px-5">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Repositório
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-xl p-4 shadow-sm"
            onPress={handleOpenGithub}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-gray-800 p-3 rounded-lg mr-4">
                <Feather name="github" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-base text-gray-800 font-semibold">
                  GitHub
                </Text>
                <Text
                  className="text-xs text-gray-500 mt-0.5"
                  numberOfLines={1}
                >
                  github.com/TCC-PET-UNIP/TCC-UNIP
                </Text>
              </View>
            </View>
            <Feather name="external-link" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View className="mt-8 px-5">
          <Text className="text-center text-xs text-gray-400 leading-5">
            © 2025 TCC-PET-UNIP{"\n"}
            Todos os direitos reservados
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
