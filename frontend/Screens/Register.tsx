import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import authService from "../services/authService";
import { RegisterAdotanteRequest, RegisterONGRequest } from "../types/types";

export default function Register() {
  const [userType, setUserType] = useState<"ADOTANTE" | "ONG">("ADOTANTE");
  const [loading, setLoading] = useState(false);

  // Campos comuns
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Campos específicos do Adotante
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");

  // Campos específicos da ONG
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");

  // Campos de endereço
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");

  const formatCNPJ = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
    return formatted;
  };

  const formatCEP = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned.replace(/^(\d{5})(\d{3})$/, "$1-$2");
    return formatted;
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    return formatted;
  };

  const handleCnpjChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 14) {
      setCnpj(formatCNPJ(cleaned));
    }
  };

  const handleCepChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 8) {
      setCep(formatCEP(cleaned));
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      setTelefone(formatPhone(cleaned));
    }
  };

  const handleRegister = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (userType === "ADOTANTE") {
        const registerData: RegisterAdotanteRequest = {
          email: email.trim().toLowerCase(),
          senha,
          confirmarSenha,
          nome,
          idade: parseInt(idade),
          telefone,
          endereco: {
            logradouro,
            numero,
            bairro,
            cidade,
            uf: uf.toUpperCase(),
            cep: cep.replace(/\D/g, ""),
          },
        };

        const response = await authService.registerAdotante(registerData);

        if (response.success) {
          Alert.alert("Sucesso", response.message, [
            { text: "OK", onPress: () => router.replace("/home") },
          ]);
        } else {
          Alert.alert("Erro", response.message);
        }
      } else {
        const registerData: RegisterONGRequest = {
          email: email.trim().toLowerCase(),
          senha,
          confirmarSenha,
          nome_fantasia: nomeFantasia,
          cnpj: cnpj.replace(/\D/g, ""),
          telefone,
          endereco: {
            logradouro,
            numero,
            bairro,
            cidade,
            uf: uf.toUpperCase(),
            cep: cep.replace(/\D/g, ""),
          },
        };

        const response = await authService.registerONG(registerData);

        if (response.success) {
          Alert.alert("Sucesso", response.message, [
            { text: "OK", onPress: () => router.replace("/home") },
          ]);
        } else {
          Alert.alert("Erro", response.message);
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Erro inesperado ao realizar cadastro");
      console.error("Erro no cadastro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#B87B56]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center px-4">
          <View className="w-full max-w-[400px] bg-[#F8F3EC] rounded-3xl p-8 items-center shadow-lg">
            <View className="w-32 h-32 rounded-full bg-[#B87B56] items-center justify-center -mt-20 mb-4 overflow-hidden border-4 border-[#B87B56]">
              <Image
                source={require("@/assets/images/Dog_Login.png")}
                className="w-28 h-28"
                resizeMode="contain"
              />
            </View>

            <Text className="text-2xl font-bold text-[#ad3434] mb-6">
              Cadastro - PetHelper
            </Text>

            {/* Seletor de tipo de usuário */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Tipo de Conta:
              </Text>
              <View className="flex-row w-full">
                <TouchableOpacity
                  onPress={() => setUserType("ADOTANTE")}
                  className={`flex-1 py-3 mx-1 rounded-lg ${
                    userType === "ADOTANTE" ? "bg-[#8DC6CE]" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`text-center font-bold ${
                      userType === "ADOTANTE" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    Adotante
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setUserType("ONG")}
                  className={`flex-1 py-3 mx-1 rounded-lg ${
                    userType === "ONG" ? "bg-[#8DC6CE]" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`text-center font-bold ${
                      userType === "ONG" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    ONG
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campos específicos por tipo */}
            {userType === "ADOTANTE" ? (
              <>
                <TextInput
                  placeholder="Nome completo"
                  value={nome}
                  onChangeText={setNome}
                  placeholderTextColor="#B87B56"
                  className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
                />
                <TextInput
                  placeholder="Idade"
                  value={idade}
                  onChangeText={setIdade}
                  keyboardType="numeric"
                  placeholderTextColor="#B87B56"
                  className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
                />
              </>
            ) : (
              <>
                <TextInput
                  placeholder="Nome fantasia da ONG"
                  value={nomeFantasia}
                  onChangeText={setNomeFantasia}
                  placeholderTextColor="#B87B56"
                  className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
                />
                <TextInput
                  placeholder="CNPJ"
                  value={cnpj}
                  onChangeText={handleCnpjChange}
                  keyboardType="numeric"
                  placeholderTextColor="#B87B56"
                  className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
                />
              </>
            )}

            {/* Campos comuns */}
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#B87B56"
              className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
            />

            <TextInput
              placeholder="Telefone"
              value={telefone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              placeholderTextColor="#B87B56"
              className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
            />

            {/* Senha */}
            <View className="w-full flex-row items-center bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-3 mb-3">
              <TextInput
                placeholder="Senha"
                placeholderTextColor="#B87B56"
                secureTextEntry={!showPassword}
                value={senha}
                onChangeText={setSenha}
                className="flex-1 py-3 text-[#B87B56] font-semibold"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#B87B56"
                />
              </TouchableOpacity>
            </View>

            {/* Confirmar Senha */}
            <View className="w-full flex-row items-center bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-3 mb-4">
              <TextInput
                placeholder="Confirmar senha"
                placeholderTextColor="#B87B56"
                secureTextEntry={!showConfirmPassword}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                className="flex-1 py-3 text-[#B87B56] font-semibold"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#B87B56"
                />
              </TouchableOpacity>
            </View>

            {/* Seção de Endereço */}
            <Text className="text-[#B87B56] font-bold text-lg mb-3 w-full text-left">
              Endereço
            </Text>

            <TextInput
              placeholder="CEP"
              value={cep}
              onChangeText={handleCepChange}
              keyboardType="numeric"
              placeholderTextColor="#B87B56"
              className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
            />

            <TextInput
              placeholder="Logradouro"
              value={logradouro}
              onChangeText={setLogradouro}
              placeholderTextColor="#B87B56"
              className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
            />

            <View className="w-full flex-row mb-3">
              <TextInput
                placeholder="Número"
                value={numero}
                onChangeText={setNumero}
                placeholderTextColor="#B87B56"
                className="flex-1 bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mr-2 text-[#B87B56] font-semibold"
              />
              <TextInput
                placeholder="UF"
                value={uf}
                onChangeText={(text) => setUf(text.toUpperCase())}
                maxLength={2}
                autoCapitalize="characters"
                placeholderTextColor="#B87B56"
                className="w-20 bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 text-[#B87B56] font-semibold"
              />
            </View>

            <TextInput
              placeholder="Bairro"
              value={bairro}
              onChangeText={setBairro}
              placeholderTextColor="#B87B56"
              className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-3 text-[#B87B56] font-semibold"
            />

            <TextInput
              placeholder="Cidade"
              value={cidade}
              onChangeText={setCidade}
              placeholderTextColor="#B87B56"
              className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 mb-6 text-[#B87B56] font-semibold"
            />

            {/* Botão de Cadastro */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="w-full bg-[#8DC6CE] rounded-lg py-3 mb-4"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="#fff" />
                  <Text className="text-white text-center font-bold text-base ml-2">
                    CADASTRANDO...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-bold text-base">
                  CADASTRAR
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="text-[#B87B56] font-bold underline text-center">
                Já tem conta? Entrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
