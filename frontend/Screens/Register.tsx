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
import {
  formatCNPJ,
  formatCEP,
  formatPhone,
  formatEmail,
  removeFormatting,
} from "../utils/formatters";
import {
  isValidEmail,
  isValidPassword,
  isPasswordMatch,
  isValidCNPJ,
  isValidCEP,
  isValidPhone,
  isValidAge,
  isNotEmpty,
  isValidName,
} from "../utils/validators";

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

  const handleCnpjChange = (text: string) => {
    const cleaned = removeFormatting(text);
    if (cleaned.length <= 14) {
      setCnpj(formatCNPJ(cleaned));
    }
  };

  const handleCepChange = (text: string) => {
    const cleaned = removeFormatting(text);
    if (cleaned.length <= 8) {
      setCep(formatCEP(cleaned));
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = removeFormatting(text);
    if (cleaned.length <= 11) {
      setTelefone(formatPhone(cleaned));
    }
  };

  const handleRegister = async () => {
    if (loading) return;

    // Validações usando os utils
    if (!isValidEmail(email)) {
      Alert.alert("Erro", "Email inválido");
      return;
    }

    if (!isValidPassword(senha)) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (!isPasswordMatch(senha, confirmarSenha)) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    if (!isValidPhone(telefone)) {
      Alert.alert("Erro", "Telefone inválido");
      return;
    }

    if (!isValidCEP(cep)) {
      Alert.alert("Erro", "CEP inválido");
      return;
    }

    // Validações específicas por tipo de usuário
    if (userType === "ADOTANTE") {
      if (!isValidName(nome)) {
        Alert.alert(
          "Erro",
          "Nome inválido (apenas letras e espaços, mínimo 2 caracteres)"
        );
        return;
      }

      if (!isValidAge(idade)) {
        Alert.alert("Erro", "Idade deve estar entre 16 e 120 anos");
        return;
      }
    } else {
      if (!isNotEmpty(nomeFantasia)) {
        Alert.alert("Erro", "Nome fantasia da ONG é obrigatório");
        return;
      }

      if (!isValidCNPJ(cnpj)) {
        Alert.alert("Erro", "CNPJ inválido");
        return;
      }
    }

    // Validações de endereço
    if (
      !isNotEmpty(logradouro) ||
      !isNotEmpty(numero) ||
      !isNotEmpty(bairro) ||
      !isNotEmpty(cidade) ||
      !isNotEmpty(uf)
    ) {
      Alert.alert("Erro", "Todos os campos de endereço são obrigatórios");
      return;
    }

    setLoading(true);

    try {
      if (userType === "ADOTANTE") {
        const registerData: RegisterAdotanteRequest = {
          conta: {
            email: formatEmail(email),
            senha,
          },
          nome: nome.trim(),
          idade: parseInt(idade),
          telefone: removeFormatting(telefone),
          endereco: {
            logradouro: logradouro.trim(),
            numero: numero.trim(),
            bairro: bairro.trim(),
            cidade: cidade.trim(),
            uf: uf.toUpperCase(),
            cep: removeFormatting(cep),
          },
        };

        const response = await authService.registerAdotante(registerData);

        if (response.success) {
          Alert.alert("Sucesso", response.message, [
            {
              text: "OK",
              onPress: () => router.replace("/adotante-questions"),
            },
          ]);
        } else {
          Alert.alert("Erro", response.message);
        }
      } else {
        const registerData: RegisterONGRequest = {
          conta: {
            email: formatEmail(email),
            senha,
          },
          nome_fantasia: nomeFantasia.trim(),
          cnpj: removeFormatting(cnpj),
          telefone: removeFormatting(telefone),
          endereco: {
            logradouro: logradouro.trim(),
            numero: numero.trim(),
            bairro: bairro.trim(),
            cidade: cidade.trim(),
            uf: uf.toUpperCase(),
            cep: removeFormatting(cep),
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

  const fillTestData = () => {
    if (userType === "ADOTANTE") {
      setNome("João Silva Santos");
      setIdade("28");
    } else {
      setNomeFantasia("ONG Amor Animal");
      setCnpj("11.444.777/0001-61");
    }

    // Dados comuns
    setEmail("teste@email.com");
    setSenha("123456");
    setConfirmarSenha("123456");
    setTelefone("(11) 99999-9999");

    // Endereço
    setLogradouro("Rua das Flores");
    setNumero("123");
    setBairro("Centro");
    setCidade("São Paulo");
    setUf("SP");
    setCep("01234-567");
  };

  return (
    <KeyboardAvoidingView
      className="register-container"
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
                style={{ width: 112, height: 112 }}
                resizeMode="contain"
              />
            </View>

            <Text className="text-2xl font-bold text-[#ad3434] mb-6">
              Cadastro - PetLar
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

            {/* Botão de Preenchimento Automático (Desenvolvimento) */}
            <TouchableOpacity
              onPress={fillTestData}
              className="w-full bg-yellow-500 rounded-lg py-2 mb-3"
            >
              <Text className="btn-pethelper-text text-center text-sm">
                🚧 PREENCHER DADOS DE TESTE 🚧
              </Text>
            </TouchableOpacity>

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
                  <Text className="btn-pethelper-text text-center ml-2">
                    CADASTRANDO...
                  </Text>
                </View>
              ) : (
                <Text className="btn-pethelper-text text-center">
                  CADASTRAR
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="text-[#B87B56] font-bold underline text-center">
                Já tem uma conta? Entre aqui
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
