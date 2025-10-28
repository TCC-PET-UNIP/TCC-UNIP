import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import ImagePickerHelper from "../utils/imagePicker";
import authService from "../services/authService";
import { UserProfile, Pet } from "../types/types";
import axios from "axios";
import API_CONFIG, { getAuthData } from "../services/apiConfig";
import BottomNavigation from "../components/BottomNavigation";
import { isNotEmpty } from "../utils/validators";
import { useIsFocused } from "@react-navigation/native";
import { getCaracteristicasTexto } from "@/mockData/mockPets";

export default function ManagePets() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);

  // Estados do modal de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editIdade, setEditIdade] = useState("");
  const [editRaca, setEditRaca] = useState("");
  const [editPeso, setEditPeso] = useState("");
  const [editSexo, setEditSexo] = useState<"Macho" | "Femea">("Macho");
  const [editDescricao, setEditDescricao] = useState("");
  const [editStatus, setEditStatus] = useState("Disponível");
  const [editFoto, setEditFoto] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // helper para resolver pet.imagem (string relativa) para { uri }
  const resolveImageSource = (petLike: any) => {
    const img = petLike?.imagem || petLike?.foto || null;
    if (!img) return null;
    if (typeof img === "string") {
      const root = API_CONFIG.BASE_URL.replace(/\/server\/?$/, "");
      const uri =
        img.startsWith("http") || img.startsWith("https")
          ? img
          : `${root}${img.startsWith("/") ? "" : "/"}${img}`;
      return { uri };
    }
    return img;
  };

  useEffect(() => {
    checkUserProfile();
  }, []);

  useEffect(() => {
    if (isFocused) {
      // loadPets já cuida de setLoading/erros internamente
      loadPets();
    }
  }, [isFocused]);

  const checkUserProfile = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (!isLoggedIn) {
        router.replace("/login");
        return;
      }

      const profile = await authService.getUserProfile();
      if (!profile || profile.tipo !== "ONG") {
        Alert.alert("Erro", "Apenas ONGs podem gerenciar pets.");
        router.replace("/home");
        return;
      }

      setUserProfile(profile);
      await loadPets();
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      router.replace("/login");
    }
  };

  const loadPets = async () => {
    try {
      setLoading(true);

      // Buscar pets da ONG no backend
      const auth = await getAuthData();
      const access = auth.access;
      const profile = auth.userProfile || userProfile;

      if (!profile || !profile.id) {
        setPets([]);
        return;
      }

      // usar endpoint /get_pets via POST enviando { ong_id } no corpo (mesma abordagem do get_compatible_pets)
      const url = `${API_CONFIG.BASE_URL}/get_pets`;
      try {
        const resp = await axios.post(
          url,
          { ong_id: profile.id },
          {
            headers: {
              Authorization: access ? `Bearer ${access}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );

        // backend may return { pets: [...] } or directly an array
        const data = resp.data;
        setPets(data.pets || data || []);
      } catch (e) {
        console.error("Erro ao buscar pets no backend:", e);
        // keep empty list if fetch fails
        setPets([]);
      }
    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      Alert.alert("Erro", "Não foi possível carregar os pets.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPets();
    setRefreshing(false);
  }, []);

  const handleAddPet = () => {
    router.push("/add-pet" as any);
  };

  const handleEditPet = (petId: number) => {
    const pet = pets.find((p) => p.id === petId);
    if (!pet) return;

    // Preencher o modal com os dados do pet
    setEditingPet(pet);
    setEditNome(pet.nome);
    setEditIdade(pet.idade.toString());
    setEditRaca(pet.raca || "");
    setEditPeso(pet.peso || "");
    setEditSexo(pet.sexo || "Macho");
    setEditDescricao(pet.descricao);
    setEditStatus(pet.status || (pet.disponivel ? "Disponível" : "Adotado"));
    // inicializa editFoto com { uri } quando backend retorna string em imagem
    setEditFoto(resolveImageSource(pet) || null);
    setEditModalVisible(true);
  };

  const handleEditImagePicker = () => {
    ImagePickerHelper.showImagePickerOptions(
      async () => {
        const picked = await ImagePickerHelper.pickFromCamera();
        if (picked) setEditFoto(picked);
      },
      async () => {
        const picked = await ImagePickerHelper.pickFromGallery();
        if (picked) setEditFoto(picked);
      }
    );
  };

  const handleSaveEdit = async () => {
    if (!editingPet) return;

    // Validações
    if (!isNotEmpty(editNome)) {
      Alert.alert("Erro", "Nome do pet é obrigatório");
      return;
    }

    const idadeNum = parseInt(editIdade);
    if (isNaN(idadeNum) || idadeNum < 0 || idadeNum > 30) {
      Alert.alert("Erro", "Idade deve ser um número entre 0 e 30 anos");
      return;
    }

    if (!isNotEmpty(editRaca)) {
      Alert.alert("Erro", "Raça do pet é obrigatória");
      return;
    }

    if (!isNotEmpty(editDescricao)) {
      Alert.alert("Erro", "Descrição do pet é obrigatória");
      return;
    }

    if (editDescricao.length < 20) {
      Alert.alert("Erro", "Descrição deve ter pelo menos 20 caracteres");
      return;
    }

    setSavingEdit(true);

    try {
      const auth = await getAuthData();
      const access = auth.access;

      // Build form data for update (supports image upload)
      const formData = new FormData();
      formData.append("id", String(editingPet.id));
      formData.append("nome", editNome);
      formData.append("idade", String(idadeNum));
      formData.append("raca", editRaca);
      formData.append("peso", editPeso);
      formData.append("sexo", editSexo);
      formData.append("descricao", editDescricao);
      formData.append(
        "disponivel",
        editStatus.toLowerCase() === "disponível" ? "true" : "false"
      );

      // If photo is a picked image object with uri, attach it
      if (editFoto && (editFoto as any).uri) {
        const localUri = (editFoto as any).uri;
        const filename = localUri.split("/").pop() || `photo_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        // @ts-ignore - React Native FormData file
        formData.append("imagem", { uri: localUri, name: filename, type });
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PET}`;

      const resp = await axios.patch(url, formData as any, {
        headers: {
          Authorization: access ? `Bearer ${access}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local list with server response if provided
      const updated = resp.data?.pet || resp.data || null;
      if (updated) {
        const updatedPets = pets.map((p) =>
          p.id === updated.id ? updated : p
        );
        setPets(updatedPets);
      } else {
        // fallback: update locally
        const updatedPets = pets.map((pet) =>
          pet.id === editingPet.id
            ? {
                ...pet,
                nome: editNome,
                idade: idadeNum,
                raca: editRaca,
                peso: editPeso,
                sexo: editSexo,
                descricao: editDescricao,
                status: editStatus,
                foto: editFoto,
              }
            : pet
        );
        setPets(updatedPets);
      }

      setEditModalVisible(false);
      Alert.alert("Sucesso", `${editNome} foi atualizado com sucesso!`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o pet.");
      console.error("Erro ao editar pet:", error);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingPet(null);
  };

  const handleDeletePet = (petId: number, petName: string) => {
    Alert.alert("Remover Pet", `Tem certeza que deseja remover ${petName}?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            const auth = await getAuthData();
            const access = auth.access;
            const url = `${API_CONFIG.BASE_URL}/delete_pet`;
            // backend espera { id } (usar POST conforme padrão dos demais endpoints)
            await axios.delete(url, {
              data: { pet_id: petId }, // corpo enviado no DELETE
              headers: {
                Authorization: `Bearer ${access}`,
                "Content-Type": "application/json",
              },
            });
          } catch (e) {
            // If server delete fails, log but continue with local removal
            console.warn(
              "Falha ao remover pet no servidor (ou endpoint não existe):",
              e
            );
          }

          // Remove locally regardless to keep UI responsive
          setPets(pets.filter((pet) => pet.id !== petId));
          Alert.alert("Sucesso", `${petName} foi removido da lista.`);
        },
      },
    ]);
  };

  const handleViewDetails = (petId: number) => {
    router.push(`/pet-details/${petId}` as any);
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
    <View className="flex-1 bg-orange-50">
      {/* Header */}
      <View className="bg-[#B87B56] pt-5 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Meus Pets</Text>
            <Text className="text-orange-100 mt-1">
              {pets.length}{" "}
              {pets.length === 1 ? "pet cadastrado" : "pets cadastrados"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddPet}
            className="bg-white rounded-full p-3 shadow-lg"
          >
            <Feather name="plus" size={24} color="#B87B56" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 100,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8DC6CE"]}
            tintColor="#8DC6CE"
          />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#B87B56" />
            <Text className="text-amber-700 mt-4">Carregando pets...</Text>
          </View>
        ) : pets.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 py-20">
            <Feather name="inbox" size={64} color="#B87B56" />
            <Text className="text-xl font-bold text-amber-800 mt-4 text-center">
              Nenhum pet cadastrado
            </Text>
            <Text className="text-amber-600 text-center mt-2 mb-6">
              Comece adicionando seu primeiro pet para adoção!
            </Text>
            <TouchableOpacity
              onPress={handleAddPet}
              className="bg-[#8DC6CE] px-8 py-4 rounded-xl"
            >
              <View className="flex-row items-center">
                <Feather name="plus-circle" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Adicionar Primeiro Pet
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-4">
            {pets.map((pet) => {
              const available =
                pet.disponivel !== undefined
                  ? pet.disponivel
                  : pet.status === "Disponível";
              const imageSource = resolveImageSource(pet);
              const caracteristicas = pet.vetor_caracteristicas
                ? getCaracteristicasTexto(pet.vetor_caracteristicas)
                    .filter((c, i, arr) => arr.indexOf(c) === i)
                    .filter((c) => {
                      if (!c) return false;
                      const normalized = c
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .trim()
                        .toLowerCase();
                      return normalized !== "caracteristica";
                    })
                : [];

              return (
                <TouchableOpacity
                  key={String(pet.id)}
                  onPress={() => handleViewDetails(pet.id)}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                >
                  <View className="flex-row">
                    {/* Foto do Pet */}
                    <View className="mr-4">
                      {imageSource ? (
                        <Image
                          source={imageSource}
                          className="w-24 h-24 rounded-xl"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-24 h-24 rounded-xl bg-orange-100 items-center justify-center">
                          <Feather name="image" size={32} color="#B87B56" />
                        </View>
                      )}

                      {/* Badge de Disponibilidade */}
                      <View
                        className="absolute top-1 left-1 px-2 py-1 rounded"
                        style={{
                          backgroundColor: available ? "#16a34a" : "#6b7280",
                        }}
                      >
                        <Text className="text-white text-xs font-bold">
                          {available ? "Disponível" : "Adotado"}
                        </Text>
                      </View>
                    </View>

                    {/* Informações do Pet */}
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-lg font-bold text-amber-800 flex-1">
                          {pet.nome || "—"}
                        </Text>
                        <View className="flex-row">
                          <TouchableOpacity
                            onPress={() => handleEditPet(pet.id)}
                            className="p-2"
                          >
                            <Feather name="edit-2" size={18} color="#8DC6CE" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeletePet(pet.id, pet.nome)}
                            className="p-2"
                          >
                            <Feather name="trash-2" size={18} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View className="flex-row items-center mb-1">
                        <Feather name="tag" size={14} color="#B87B56" />
                        <Text className="text-amber-700 text-sm ml-1">
                          {pet.raca || "—"}
                        </Text>
                      </View>

                      <View className="flex-row items-center mb-1">
                        <Feather name="calendar" size={14} color="#B87B56" />
                        <Text className="text-amber-700 text-sm ml-1">
                          {pet.idade !== undefined
                            ? `${pet.idade} ${
                                Number(pet.idade) === 1 ? "ano" : "anos"
                              }`
                            : "—"}
                        </Text>
                        <Text className="text-amber-500 mx-2">•</Text>
                        <Text className="text-amber-700 text-sm">
                          {pet.sexo || "—"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text
                    className="text-amber-600 text-sm mt-3"
                    numberOfLines={2}
                  >
                    {pet.descricao || "—"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Botão Flutuante de Adicionar (alternativa ao header) */}
      {pets.length > 0 && (
        <TouchableOpacity
          onPress={handleAddPet}
          className="absolute bottom-24 right-6 bg-[#8DC6CE] w-16 h-16 rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          <Feather name="plus" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Modal de Edição */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <KeyboardAvoidingView
          className="flex-1 bg-orange-50"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header do Modal */}
          <View className="bg-[#B87B56] pt-5 pb-6 px-6 flex-row items-center">
            <TouchableOpacity onPress={handleCancelEdit} className="mr-4">
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white flex-1">
              Editar Pet
            </Text>
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={savingEdit}
              className="bg-white px-4 py-2 rounded-lg"
            >
              {savingEdit ? (
                <ActivityIndicator size="small" color="#B87B56" />
              ) : (
                <Text className="text-[#B87B56] font-bold">Salvar</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 py-6">
              {/* Foto do Pet */}
              <View className="items-center mb-6">
                <TouchableOpacity
                  onPress={handleEditImagePicker}
                  className="w-32 h-32 rounded-full bg-amber-100 items-center justify-center border-4 border-[#B87B56] overflow-hidden"
                >
                  {editFoto ? (
                    <Image
                      source={editFoto}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Feather name="camera" size={40} color="#B87B56" />
                  )}
                </TouchableOpacity>
                <Text className="text-amber-700 text-sm mt-2">
                  Toque para alterar foto
                </Text>
              </View>

              {/* Card de Informações Básicas */}
              <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <Text className="text-lg font-bold text-amber-800 mb-4">
                  Informações Básicas
                </Text>

                {/* Nome */}
                <Text className="text-amber-700 font-semibold mb-2">
                  Nome *
                </Text>
                <TextInput
                  placeholder="Nome do pet"
                  value={editNome}
                  onChangeText={setEditNome}
                  placeholderTextColor="#B87B56"
                  className="w-full bg-orange-50 border border-amber-300 rounded-lg px-4 py-3 mb-4 text-amber-800"
                />

                {/* Idade */}
                <Text className="text-amber-700 font-semibold mb-2">
                  Idade (anos) *
                </Text>
                <TextInput
                  placeholder="Idade do pet"
                  value={editIdade}
                  onChangeText={setEditIdade}
                  keyboardType="numeric"
                  placeholderTextColor="#B87B56"
                  className="w-full bg-orange-50 border border-amber-300 rounded-lg px-4 py-3 mb-4 text-amber-800"
                />

                {/* Raça */}
                <Text className="text-amber-700 font-semibold mb-2">
                  Raça *
                </Text>
                <TextInput
                  placeholder="Raça do pet"
                  value={editRaca}
                  onChangeText={setEditRaca}
                  placeholderTextColor="#B87B56"
                  className="w-full bg-orange-50 border border-amber-300 rounded-lg px-4 py-3 mb-4 text-amber-800"
                />

                {/* Sexo */}
                <Text className="text-amber-700 font-semibold mb-2">
                  Sexo *
                </Text>
                <View className="flex-row mb-4">
                  <TouchableOpacity
                    onPress={() => setEditSexo("Macho")}
                    className={`flex-1 py-3 mr-2 rounded-lg ${
                      editSexo === "Macho" ? "bg-[#8DC6CE]" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-center font-bold ${
                        editSexo === "Macho" ? "text-white" : "text-gray-600"
                      }`}
                    >
                      Macho
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditSexo("Femea")}
                    className={`flex-1 py-3 ml-2 rounded-lg ${
                      editSexo === "Femea" ? "bg-[#8DC6CE]" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-center font-bold ${
                        editSexo === "Femea" ? "text-white" : "text-gray-600"
                      }`}
                    >
                      Fêmea
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Card de Status */}
              <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <Text className="text-lg font-bold text-amber-800 mb-4">
                  Status
                </Text>

                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => setEditStatus("Disponível")}
                    className={`flex-1 py-3 mr-2 rounded-lg ${
                      editStatus === "Disponível"
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-center font-bold ${
                        editStatus === "Disponível"
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      Disponível
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditStatus("Adotado")}
                    className={`flex-1 py-3 ml-2 rounded-lg ${
                      editStatus === "Adotado" ? "bg-gray-500" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-center font-bold ${
                        editStatus === "Adotado"
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      Adotado
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
                  value={editDescricao}
                  onChangeText={setEditDescricao}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor="#B87B56"
                  className="w-full bg-orange-50 border border-amber-300 rounded-lg px-4 py-3 text-amber-800"
                />
                <Text className="text-amber-500 text-xs mt-1">
                  {editDescricao.length} caracteres
                </Text>
              </View>

              {/* Botões de Ação */}
              <TouchableOpacity
                onPress={handleSaveEdit}
                disabled={savingEdit}
                className="w-full bg-[#8DC6CE] rounded-lg py-4 shadow-md mb-3"
                style={{ opacity: savingEdit ? 0.7 : 1 }}
              >
                {savingEdit ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="#fff" />
                    <Text className="text-white text-center font-bold text-base ml-2">
                      SALVANDO...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-bold text-base">
                    SALVAR ALTERAÇÕES
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelEdit}
                className="w-full bg-gray-300 rounded-lg py-4"
              >
                <Text className="text-gray-700 text-center font-bold text-base">
                  CANCELAR
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <BottomNavigation userType={userProfile.tipo} />
    </View>
  );
}
