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
import axios from "axios";
import API_CONFIG, { saveAuthData, getAuthData } from "../services/apiConfig";
import { LoginRequest } from "../types/types";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { access: token } = await getAuthData();
        if (token) router.replace("/home");
      } catch (err) {
        console.error("Erro ao verificar sessão: ", err);
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

    setLoading(true);

    try {
      const resp = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          email: trimmedEmail,
          password: pwd,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { user, access, refresh } = resp.data;

      if (access && refresh && user) {
        // build minimal userProfile similar to authService.buildUserProfile
        let userProfile: any = null;
        if (user.ong) {
          userProfile = {
            id: user.ong.id,
            email: "",
            tipo: "ONG",
            data_cadastro: new Date(),
            nome_fantasia: user.ong.nome_fantasia,
            cnpj: user.ong.cnpj,
            telefone: user.ong.telefone,
            endereco: user.ong.endereco || null,
          };
        } else if (user.adotante) {
          userProfile = {
            id: user.adotante.id,
            email: "",
            tipo: "ADOTANTE",
            data_cadastro: new Date(),
            nome: user.adotante.nome,
            idade: user.adotante.idade,
            telefone: user.adotante.telefone,
            endereco: user.adotante.endereco || null,
          };
        }

        // persist tokens and profile using centralized helper
        await saveAuthData(access, refresh, userProfile);

        Alert.alert(
          "Sucesso",
          `Bem-vindo(a), ${userProfile?.nome || userProfile?.nome_fantasia || "usuário"}!`
        );
        router.replace("/home");
      } else {
        Alert.alert("Erro", "Resposta inválida do servidor");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erro inesperado ao realizar login";
      Alert.alert("Erro", msg);
      console.error("Erro no login:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = async (userType: "ADOTANTE" | "ONG") => {
    if (loading) return;

    setLoading(true);

    try {
      const emailMock =
        userType === "ONG" ? "teste2@email.com" : "teste@email.com";
      const resp = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        { email: emailMock, senha: "123456" },
        { headers: { "Content-Type": "application/json" } }
      );

      const { user, access, refresh } = resp.data;
      if (access && refresh && user) {
        let userProfile: any = null;
        if (user.ong) {
          userProfile = {
            id: user.ong.id,
            email: "",
            tipo: "ONG",
            data_cadastro: new Date(),
            nome_fantasia: user.ong.nome_fantasia,
            cnpj: user.ong.cnpj,
            telefone: user.ong.telefone,
            endereco: user.ong.endereco || null,
          };
        } else if (user.adotante) {
          userProfile = {
            id: user.adotante.id,
            email: "",
            tipo: "ADOTANTE",
            data_cadastro: new Date(),
            nome: user.adotante.nome,
            idade: user.adotante.idade,
            telefone: user.adotante.telefone,
            endereco: user.adotante.endereco || null,
          };
        }

        await saveAuthData(access, refresh, userProfile);

        Alert.alert(
          "Demo Login",
          `Login automático realizado! Bem-vindo(a), ${userProfile?.nome || userProfile?.nome_fantasia || "usuário"}!`
        );
        router.replace("/home");
      } else {
        Alert.alert("Erro", "Resposta inválida do servidor");
      }
    } catch (err: any) {
      Alert.alert("Erro", "Erro inesperado ao realizar login automático");
      console.error("Erro no login automático:", err);
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
        <View className="w-full min-h-[450px] max-w-[380px] bg-[#F8F3EC] rounded-3xl p-10 items-center shadow-lg">
          <View className="w-32 h-32 rounded-full bg-[#B87B56] items-center justify-center -mt-20 mb-2 overflow-hidden border-4 border-[#B87B56]">
            <Image
              source={require("@/assets/images/petlar_logo.png")}
              style={{ width: 112, height: 112 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-3xl font-bold text-[#ad3434] mb-6 mt-2">
            PetLar
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

          {/* Botões Demo Login: ADOTANTE e ONG (empilhados) */}
          <View className="w-full flex-col mb-4">
            <TouchableOpacity
              onPress={() => handleMockLogin("ADOTANTE")}
              disabled={loading}
              className="w-full bg-[#ad3434] rounded-lg py-3 mb-3"
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
                <View className="flex-row items-center justify-center">
                  <Feather
                    name="zap"
                    size={16}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white text-center font-bold text-base">
                    LOGIN ADOTANTE
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleMockLogin("ONG")}
              disabled={loading}
              className="w-full bg-[#6b9bb2] rounded-lg py-3"
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
                <View className="flex-row items-center justify-center">
                  <Feather
                    name="home"
                    size={16}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white text-center font-bold text-base">
                    LOGIN ONG
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-[#B87B56] font-bold underline text-center top-3">
                Ainda não tem uma conta? Cadastre-se aqui
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
