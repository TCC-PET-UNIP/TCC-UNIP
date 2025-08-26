import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockUsers } from "../mockData/mockUsers";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const json = await AsyncStorage.getItem("user");
        if (json) router.replace("/home");
      } catch {
        /* ignore */
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    if (loading) return;

    const trimmedEmail = email.trim().toLowerCase();
    const pwd = password;

    if (!trimmedEmail || !pwd) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Erro", "Por favor, informe um email válido");
      return;
    }

    if (pwd.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      const user = mockUsers.find(
        (u) => u.email.toLowerCase() === trimmedEmail && u.password === pwd
      );

      if (!user) throw new Error("Email ou senha incorretos");

      // armazena usuário sem senha
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...safeUser } = user;
      await AsyncStorage.setItem("user", JSON.stringify(safeUser));

      Alert.alert("Sucesso", `Bem-vindo(a), ${user.name}`);
      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Erro ao realizar login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#B87B56]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 items-center justify-center px-4">
        <View className="w-full min-h-[390px] max-w-[380px] bg-[#F8F3EC] rounded-3xl p-10 items-center shadow-lg">
          <View className="w-32 h-32 rounded-full bg-[#B87B56] items-center justify-center -mt-20 mb-2 overflow-hidden border-4 border-[#B87B56]">
            <Image
              source={require("@/assets/images/Dog_Login.png")}
              className="w-28 h-28"
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-bold text-[#ad3434] mb-6 mt-2">
            PetHelper
          </Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#B87B56"
            className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View className="w-full flex-row items-center bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-3 mb-5">
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#B87B56"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              className="flex-1 py-3 text-[#B87B56] font-semibold"
              textAlign="left"
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#B87B56"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="w-full bg-[#8DC6CE] rounded-lg py-3 mb-4"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="#fff" />
                <Text className="text-white text-center font-bold text-base ml-2">
                  ENTRANDO...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-base">
                ENTRAR
              </Text>
            )}
          </TouchableOpacity>

          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-[#B87B56] font-bold underline text-center">
                Ainda não tem conta? Cadastre-se
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <Text className="text-white font-bold text-center relative bottom-40 w-full">
        TCC - UNIP
      </Text>
    </KeyboardAvoidingView>
  );
}
