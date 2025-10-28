import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import ImagePickerHelper from "../utils/imagePicker";
import authService from "../services/authService";
import { UserProfile } from "../types/types";
import axios from "axios";
import API_CONFIG, { getAuthData } from "../services/apiConfig";
import BottomNavigation from "../components/BottomNavigation";
import { isNotEmpty } from "../utils/validators";

export default function AddPet() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Estados para os campos do pet
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [raca, setRaca] = useState("");
  const [peso, setPeso] = useState("");
  const [sexo, setSexo] = useState<"Macho" | "Fêmea">("Macho");
  const [descricao, setDescricao] = useState("");
  const [castrado, setCastrado] = useState<boolean>(false);
  const [foto, setFoto] = useState<any>(null);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (!isLoggedIn) {
        router.replace("/login");
        return;
      }

      const profile = await authService.getUserProfile();
      if (!profile || profile.tipo !== "ONG") {
        Alert.alert("Erro", "Apenas ONGs podem adicionar pets.");
        router.back();
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      router.replace("/login");
    }
  };

  const handleImagePicker = () => {
    ImagePickerHelper.showImagePickerOptions(
      async () => {
        const picked = await ImagePickerHelper.pickFromCamera();
        if (picked) setFoto(picked);
      },
      async () => {
        const picked = await ImagePickerHelper.pickFromGallery();
        if (picked) setFoto(picked);
      }
    );
  };

  const handleAddPet = async () => {
    if (loading) return;

    // Validações
    if (!isNotEmpty(nome)) {
      Alert.alert("Erro", "Nome do pet é obrigatório");
      return;
    }

    if (!isNotEmpty(idade)) {
      Alert.alert("Erro", "Idade do pet é obrigatória");
      return;
    }

    const idadeNum = parseInt(idade);
    if (isNaN(idadeNum) || idadeNum < 0 || idadeNum > 30) {
      Alert.alert("Erro", "Idade deve ser um número entre 0 e 30 anos");
      return;
    }

    if (!isNotEmpty(raca)) {
      Alert.alert("Erro", "Raça do pet é obrigatória");
      return;
    }

    if (!isNotEmpty(peso)) {
      Alert.alert("Erro", "Peso do pet é obrigatório");
      return;
    }

    if (!isNotEmpty(descricao)) {
      Alert.alert("Erro", "Descrição do pet é obrigatória");
      return;
    }

    if (descricao.length < 20) {
      Alert.alert("Erro", "Descrição deve ter pelo menos 20 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Build form data to send to backend
      const auth = await getAuthData();
      const access = auth.access;
      const profile = auth.userProfile || userProfile;

      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("idade", String(idadeNum));
      formData.append("raca", raca);
      formData.append("peso", peso);
      formData.append("sexo", sexo);
      formData.append("descricao", descricao);
      // seguir documentação: incluir campo disponivel
      formData.append("disponivel", "true");

      // include ong id if backend expects it
      if (profile && profile.id) {
        formData.append("ong_id", String(profile.id));
      }

      if (foto && (foto as any).uri) {
        const localUri = (foto as any).uri;
        const filename = localUri.split("/").pop() || `photo_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        // @ts-ignore
        // chave esperada pelo backend conforme documentação: "imagem"
        formData.append("imagem", { uri: localUri, name: filename, type });
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER_PET}`;

      const resp = await axios.post(url, formData as any, {
        headers: {
          Authorization: access ? `Bearer ${access}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      });

      // If backend returns the created pet, you could navigate to details or update lists
      Alert.alert("Sucesso", `Pet ${nome} cadastrado com sucesso!`, [
        {
          text: "OK",
          onPress: () => {
            // Limpar formulário
            setNome("");
            setIdade("");
            setRaca("");
            setPeso("");
            setDescricao("");
            setFoto(null);
            setSexo("Macho");
            // opcional: navegar para lista de pets
            router.back();
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível cadastrar o pet.");
      console.error("Erro ao adicionar pet:", error);
    } finally {
      setLoading(false);
    }
  };

  const fillTestData = () => {
    setNome("Rex");
    setIdade("3");
    setRaca("Labrador");
    setPeso("25kg");
    setSexo("Macho");
    setDescricao(
      "Rex é um cachorro muito dócil e carinhoso, adora brincar e fazer companhia. Está procurando um lar amoroso para chamar de seu."
    );
  };

  if (!userProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-orange-50">
        <ActivityIndicator size="large" color="#B87B56" />
        <Text className="text-amber-700 mt-4">Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-orange-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="bg-[#B87B56] pt-5 pb-6 px-6 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white flex-1">
          Adicionar Pet
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-6">
          {/* Foto do Pet */}
          <View className="items-center mb-6">
            <TouchableOpacity
              onPress={handleImagePicker}
              className="w-32 h-32 rounded-full bg-amber-100 items-center justify-center border-4 border-[#B87B56] overflow-hidden"
            >
              {foto ? (
                <Image
                  source={foto}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Feather name="camera" size={40} color="#B87B56" />
              )}
            </TouchableOpacity>
            <Text className="text-amber-700 text-sm mt-2">
              Toque para adicionar foto
            </Text>
          </View>

          {/* Card de Formulário */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <Text className="text-lg font-bold text-amber-800 mb-4">
              Informações Básicas
            </Text>

            {/* Nome */}
            <Text className="text-amber-700 font-semibold mb-2">Nome *</Text>
            <TextInput
              placeholder="Nome do pet"
              value={nome}
              onChangeText={setNome}
              placeholderTextColor="#B87B56"
              className="w-full bg-orange-50 border border-amber-300 rounded-lg px-4 py-3 mb-4 text-amber-800"
            />

            {/* Idade */}
            <Text className="text-amber-700 font-semibold mb-2">
              Idade (anos) *
            </Text>
            <TextInput
              placeholder="Idade do pet"
              value={idade}
              onChangeText={setIdade}
              keyboardType="numeric"
              placeholderTextColor="#B87B56"
              className="w-full bg-orange-50 border border-amber-300 rounded-lg px-4 py-3 mb-4 text-amber-800"
            />

            {/* Raça */}
            <Text className="text-amber-700 font-semibold mb-2">Raça *</Text>
            <TextInput
              placeholder="Raça do pet"
              value={raca}
              onChangeText={setRaca}
              placeholderTextColor="#B87B56"
              className="w-full bg-orange-50 border border-amber-300 rounded-lg px-4 py-3 mb-4 text-amber-800"
            />

            {/* Sexo */}
            <Text className="text-amber-700 font-semibold mb-2">Sexo *</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                onPress={() => setSexo("Macho")}
                className={`flex-1 py-3 mr-2 rounded-lg ${
                  sexo === "Macho" ? "bg-[#8DC6CE]" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-center font-bold ${
                    sexo === "Macho" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Macho
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSexo("Fêmea")}
                className={`flex-1 py-3 ml-2 rounded-lg ${
                  sexo === "Fêmea" ? "bg-[#8DC6CE]" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-center font-bold ${
                    sexo === "Fêmea" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Fêmea
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card de Descrição */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <Text className="text-lg font-bold text-amber-800 mb-4">
              Descrição *
            </Text>
            <Text className="text-amber-600 text-sm mb-2">
              Conte mais sobre a personalidade e história do pet (mínimo 20
              caracteres)
            </Text>
            <TextInput
              placeholder="Ex: É um cachorro muito dócil e carinhoso..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#B87B56"
              className="w-full bg-orange-50 border border-amber-300 rounded-lg px-4 py-3 text-amber-800"
            />
            <Text className="text-amber-500 text-xs mt-1">
              {descricao.length} caracteres
            </Text>
          </View>

          {/* Botão de Preenchimento Automático (Desenvolvimento) */}
          <TouchableOpacity
            onPress={fillTestData}
            className="w-full bg-yellow-500 rounded-lg py-3 mb-3"
          >
            <Text className="text-white text-center font-bold">
              🚧 PREENCHER DADOS DE TESTE 🚧
            </Text>
          </TouchableOpacity>

          {/* Botão de Cadastro */}
          <TouchableOpacity
            onPress={handleAddPet}
            disabled={loading}
            className="w-full bg-[#8DC6CE] rounded-lg py-4 shadow-md"
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
                CADASTRAR PET
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavigation userType={userProfile.tipo} />
    </KeyboardAvoidingView>
  );
}
