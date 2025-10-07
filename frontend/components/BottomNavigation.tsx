import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

interface BottomNavigationProps {
  userType?: "ADOTANTE" | "ONG";
}

export default function BottomNavigation({ userType }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getIconColor = (route: string) => {
    return pathname.includes(route) ? "#8DC6CE" : "#B87B56";
  };

  return (
    <View className="flex-row bg-orange-50 py-3 px-5 border-t border-amber-700/20 justify-around items-center absolute bottom-0 left-0 right-0 pb-5">
      {/* Home */}
      <TouchableOpacity
        className="p-2 rounded-xl items-center justify-center"
        onPress={() => router.push("/home")}
      >
        <Feather
          name="home"
          size={24}
          color={
            pathname === "/home" || pathname === "/" ? "#8DC6CE" : "#B87B56"
          }
        />
      </TouchableOpacity>

      {userType === "ONG" && (
        <TouchableOpacity
          className="p-2 rounded-xl items-center justify-center"
          onPress={() => {
            // TODO: Implementar tela de gerenciamento de pets
          }}
        >
          <Feather
            name="clipboard"
            size={24}
            color={getIconColor("gerenciar")}
          />
        </TouchableOpacity>
      )}

      {/* Notificações */}
      <TouchableOpacity
        className="p-2 rounded-xl items-center justify-center"
        onPress={() => {
          // TODO: Implementar tela de notificações
        }}
      >
        <Feather name="bell" size={24} color={getIconColor("notificacoes")} />
      </TouchableOpacity>

      <TouchableOpacity
        className="p-2 rounded-xl items-center justify-center"
        onPress={() => router.push("/profile")}
      >
        <Feather name="user" size={24} color={getIconColor("profile")} />
      </TouchableOpacity>

      {/* Configurações */}
      <TouchableOpacity
        className="p-2 rounded-xl items-center justify-center"
        onPress={() => router.push("/settings" as any)}
      >
        <Feather name="settings" size={24} color={getIconColor("settings")} />
      </TouchableOpacity>
    </View>
  );
}
