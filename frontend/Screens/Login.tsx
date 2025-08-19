import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import Feather from "@expo/vector-icons/Feather";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro: Por favor, preencha todos os campos");
      return;
    }

    setLoading(true)
  }

  // Função de mudar visibilidade da senha
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
            onChangeText={(text) => setEmail(text)}
            placeholderTextColor="#B87B56"
            className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
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
            <TouchableOpacity onPress={toggleShowPassword}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#B87B56"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="w-full bg-[#8DC6CE] rounded-lg py-3 mb-4">
            <Text className="text-white text-center font-bold text-base">
              ENTRAR
            </Text>
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
      <Text className="text-white font-bold text-center absolute bottom-40 w-full">
        TCC - UNIP
      </Text>
    </KeyboardAvoidingView>
  );
}
