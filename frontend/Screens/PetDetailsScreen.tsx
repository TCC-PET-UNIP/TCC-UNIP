import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { getCaracteristicasTexto } from "../utils/formatters";
import axios from "axios";
import API_CONFIG, { getAuthData } from "../services/apiConfig";
import { Pet } from "../types/types";
import BottomNavigation from "../components/BottomNavigation";
import authService from "../services/authService";
import { removeFormatting } from "../utils/formatters";

export default function PetDetailsScreen() {
  const router = useRouter();
  const { id, pet: petParam } = useLocalSearchParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [ongInfo, setOngInfo] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // helper para resolver pet.imagem (string relativa) para { uri }
  const resolveImageSource = (petLike: any) => {
    const img = petLike?.imagem || petLike?.foto || null;
    if (!img) return null;
    if (typeof img === "string") {
      const root = API_CONFIG.BASE_URL.replace(/\/server\/?$/, "");
      const uri = img.startsWith("http")
        ? img
        : `${root}${img.startsWith("/") ? "" : "/"}${img}`;
      return { uri };
    }
    return img;
  };

  // Mock de múltiplas imagens para o pet (usando a mesma imagem)
  const petImages = pet
    ? [
        resolveImageSource(pet),
        resolveImageSource(pet),
        resolveImageSource(pet),
      ].filter(Boolean)
    : [];

  useEffect(() => {
    // se o parâmetro 'pet' foi passado na navegação, usa-o imediatamente
    if (petParam) {
      try {
        const parsed =
          typeof petParam === "string"
            ? JSON.parse(decodeURIComponent(petParam as string))
            : (petParam as any);
        setPet(parsed as Pet);
      } catch (e) {
        // se parsing falhar, tenta carregar pela API abaixo
        console.warn("Falha ao parsear pet param, irá buscar pela API", e);
      }
    }

    if (id) {
      const numericId = Number(id);
      // se pet já foi definido via param e tem o mesmo id, evita nova requisição
      if (!pet || pet.id !== numericId) {
        loadPet(numericId);
      }
    }

    loadUserProfile();
    // quando pet mudar, extrai info da ong
    if (pet) extractOngInfoFromPet(pet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, petParam, pet]);

  const loadUserProfile = async () => {
    try {
      const profile = await authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const loadPet = async (numericId: number) => {
    try {
      const auth = await getAuthData();
      const access = auth.access;

      // Primeiro tenta o novo endpoint POST /get_pet_by_id
      try {
        const url = `${API_CONFIG.BASE_URL}/get_pet_by_id`;
        const resp = await axios.post(
          url,
          { pet_id: String(numericId) },
          {
            headers: { Authorization: access ? `Bearer ${access}` : undefined },
          }
        );
        const data = resp.data;
        const found = data.pet || data || null;
        if (found) {
          setPet(found);
          // backend now may include the ong object inside the pet response
          if (found.ong && typeof found.ong === "object") {
            setOngInfo(found.ong);
          }
          return;
        }
      } catch (e) {
        // fallback para métodos antigos caso endpoint não exista
        console.warn("get_pet_by_id falhou, tentando rotas antigas", e);
      }

      // Fallback: tentar rota /pets (se disponível)
      try {
        const urlQuery = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PETS}?id=${numericId}`;
        const resp2 = await axios.get(urlQuery, {
          headers: { Authorization: access ? `Bearer ${access}` : undefined },
        });
        const data = resp2.data;
        if (Array.isArray(data)) {
          setPet(data[0] || null);
        } else if (data.pet) {
          setPet(data.pet);
        } else if (Array.isArray(data.pets)) {
          setPet(data.pets[0] || null);
        } else {
          setPet(null);
        }
      } catch (e) {
        console.error("Erro ao carregar pet (fallback):", e);
        setPet(null);
      }
    } catch (error) {
      console.error("Erro ao carregar pet:", error);
      setPet(null);
    }
  };

  // Extrai informações da ONG do objeto pet quando disponíveis
  const extractOngInfoFromPet = async (petObj: any) => {
    if (!petObj) return setOngInfo(null);

    // Se já vier um objeto nested 'ong', usa ele diretamente
    if (petObj.ong && typeof petObj.ong === "object") {
      setOngInfo(petObj.ong);
      return;
    }

    // Se o backend adicionou campos 'ong_nome', 'ong_telefone', 'ong_foto', usa-os
    if (
      petObj.ong_nome ||
      petObj.ong_telefone ||
      petObj.ong_foto ||
      petObj.ong_imagem
    ) {
      setOngInfo({
        nome_fantasia:
          petObj.ong_nome_fantasia ||
          petObj.ong_nome ||
          petObj.ong_nome_fantasia ||
          petObj.ong_nome,
        telefone: petObj.ong_telefone || petObj.ong_telefone,
        imagem: petObj.ong_foto || petObj.ong_imagem,
        endereco: petObj.ong_endereco,
      });
      return;
    }

    // Se só veio ong_id (pk/obj), tenta buscar via endpoint (se existir)
    const ongId =
      petObj.ong_id &&
      (typeof petObj.ong_id === "object"
        ? petObj.ong_id.id || petObj.ong_id
        : petObj.ong_id);
    if (ongId) {
      try {
        const auth = await getAuthData();
        const access = auth.access;
        const url = `${API_CONFIG.BASE_URL}/get_ong_by_id`;
        const resp = await axios.post(
          url,
          { ong_id: String(ongId) },
          {
            headers: { Authorization: access ? `Bearer ${access}` : undefined },
          }
        );
        const data = resp.data;
        const obj = data.ong || data || null;
        if (obj) {
          setOngInfo(obj);
          return;
        }
      } catch (e) {
        // endpoint pode não existir; ignora
      }
    }

    setOngInfo(null);
  };

  const handleAgendarVisita = () => {
    if (!pet) return;
    const phone =
      (ongInfo && (ongInfo.telefone || ongInfo.telefone_cadastro)) ||
      pet?.ong_telefone ||
      (pet as any)?.ong?.telefone ||
      null;

    Alert.alert(
      "Agendar Visita",
      `Gostaria de agendar uma visita para conhecer ${pet.nome}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Ligar para ONG",
          onPress: () => {
            if (phone) {
              Linking.openURL(`tel:${removeFormatting(phone)}`);
            }
          },
        },
        {
          text: "WhatsApp",
          onPress: () => {
            if (phone) {
              const phoneNumber = removeFormatting(phone);
              const message = `Olá! Gostaria de agendar uma visita para conhecer ${pet.nome}.`;
              Linking.openURL(
                `whatsapp://send?phone=55${phoneNumber}&text=${encodeURIComponent(message)}`
              );
            }
          },
        },
      ]
    );
  };

  const handleVoltar = () => {
    router.back();
  };

  if (!pet) {
    return (
      <View className="flex-1 justify-center items-center bg-[#B87B56]">
        <Text className="text-lg text-white mb-5">
          Pet não encontrado (ID: {id})
        </Text>
        <TouchableOpacity
          onPress={handleVoltar}
          className="bg-white px-5 py-2.5 rounded-lg"
        >
          <Text className="text-[#B87B56] text-base font-bold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const caracteristicas = pet
    ? getCaracteristicasTexto(pet.vetor_caracteristicas)
    : [];

  // Fonte de imagem da ONG (resolve string -> {uri})
  const ongImageSrc =
    resolveImageSource(ongInfo) ||
    resolveImageSource({ imagem: pet?.ong_foto || (pet as any)?.ong_imagem || (pet as any)?.ong?.imagem });

  // Formata um objeto de endereço (ou string) para exibir no texto
  const formattedOngAddress = (() => {
    const addr = ongInfo?.endereco || (pet as any)?.ong_endereco;
    if (!addr) return null;
    if (typeof addr === "string") return addr;
    if (typeof addr === "object") {
      const parts: string[] = [];
      if (addr.logradouro) parts.push(addr.logradouro + (addr.numero ? `, ${addr.numero}` : ""));
      if (addr.bairro) parts.push(addr.bairro);
      const cityUf = [addr.cidade, addr.uf].filter(Boolean).join(" - ");
      if (cityUf) parts.push(cityUf);
      if (addr.cep) parts.push(`CEP ${addr.cep}`);
      return parts.join(", ");
    }
    return String(addr);
  })();

  return (
    <View className="flex-1 bg-amber-700">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row items-center justify-between pt-16 pb-5 px-5">
          <TouchableOpacity
            onPress={handleVoltar}
            className="p-2 rounded-xl bg-white/20"
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1 text-center mx-5">
            {pet?.nome || "Pet"}
          </Text>
          <View className="w-10" />
        </View>

        <View className="mx-5 mb-4">
          <View className="h-72 rounded-xl overflow-hidden">
            <Image
              source={petImages[selectedImageIndex]}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Miniaturas das imagens */}
        <View className="flex-row justify-center px-5 mb-8 space-x-3">
          {petImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImageIndex(index)}
              className="p-1 w-20 h-20 rounded-lg overflow-hidden"
              style={{
                borderWidth: selectedImageIndex === index ? 2 : 0,
                borderColor:
                  selectedImageIndex === index ? "#FFFFFF" : "transparent",
              }}
            >
              <Image
                source={image}
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Card de informações do pet */}
        <View className="mx-5 mb-5">
          <View className="bg-white rounded-xl p-5 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              Informações do Pet
            </Text>

            {/* Nome */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-base text-gray-600 font-medium">
                  Nome:
                </Text>
                <Text className="text-base text-gray-800 font-semibold">
                  {pet?.nome}
                </Text>
              </View>
            </View>

            {/* Idade */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-base text-gray-600 font-medium">
                  Idade:
                </Text>
                <Text className="text-base text-gray-800 font-semibold">
                  {pet?.idade} {pet?.idade === 1 ? "ano" : "anos"}
                </Text>
              </View>
            </View>

            {/* Raça */}
            {pet?.raca && (
              <View className="mb-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-base text-gray-600 font-medium">
                    Raça:
                  </Text>
                  <Text className="text-base text-gray-800 font-semibold">
                    {pet.raca}
                  </Text>
                </View>
              </View>
            )}

            {/* Sexo */}
            {pet?.sexo && (
              <View className="mb-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-base text-gray-600 font-medium">
                    Sexo:
                  </Text>
                  <Text className="text-base text-gray-800 font-semibold">
                    {pet.sexo}
                  </Text>
                </View>
              </View>
            )}

            {/* Peso */}
            {pet?.peso && (
              <View className="mb-3">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-base text-gray-600 font-medium">
                    Peso:
                  </Text>
                  <Text className="text-base text-gray-800 font-semibold">
                    {pet.peso}
                  </Text>
                </View>
              </View>
            )}

            {/* Saúde */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-base text-gray-600 font-medium">
                  Vacinado:
                </Text>
                <Text className="text-base text-gray-800 font-semibold">
                  {pet?.vacinado ? "Sim" : "Não"}
                </Text>
              </View>
            </View>

            {/* Castrado */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-base text-gray-600 font-medium">
                  Castrado:
                </Text>
                <Text className="text-base text-gray-800 font-semibold">
                  {pet?.castrado ? "Sim" : "Não"}
                </Text>
              </View>
            </View>

            {/* Características */}
            {caracteristicas.length > 0 && (
              <View className="mb-3">
                <View className="py-2 border-b border-gray-200">
                  <Text className="text-base text-gray-600 font-medium mb-2">
                    Características:
                  </Text>
                  <View className="flex-row flex-wrap">
                    {caracteristicas.map((caracteristica, index) => (
                      <View
                        key={index}
                        className="bg-teal-100 rounded-full px-3 py-1 mr-2 mb-2"
                      >
                        <Text className="text-sm text-teal-700">
                          {caracteristica}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Descrição */}
            {pet?.descricao && (
              <View className="mb-3">
                <View className="py-2">
                  <Text className="text-base text-gray-600 font-medium mb-2">
                    Descrição:
                  </Text>
                  <Text className="text-sm text-gray-700 leading-5 text-justify">
                    {pet.descricao}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Card da ONG */}
        <View className="mx-5 mb-5">
          <View className="bg-white rounded-xl p-5 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-bold text-gray-800 mb-1">
                  {ongInfo?.nome_fantasia ||
                    pet?.ong_nome ||
                    (pet as any)?.ong_nome_fantasia ||
                    "ONG Responsável"}
                </Text>
                {formattedOngAddress && (
                  <Text className="text-sm text-gray-600 mb-2 leading-5">
                    {formattedOngAddress}
                  </Text>
                )}
                {(ongInfo?.telefone || pet?.ong_telefone) && (
                  <Text className="text-sm text-gray-600">
                    📞 {ongInfo?.telefone || pet?.ong_telefone}
                  </Text>
                )}
              </View>
              <View className="w-16 h-16 bg-gray-100 rounded-lg justify-center items-center overflow-hidden">
                {ongImageSrc ? (
                  <Image
                    source={ongImageSrc}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name="heart" size={24} color="#8DC6CE" />
                )}
              </View>
            </View>

            <TouchableOpacity
              className="bg-teal-400 py-3 rounded-lg items-center"
              onPress={handleAgendarVisita}
            >
              <Text className="text-white text-base font-bold">
                Entrar em Contato
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Navegação inferior */}
      <BottomNavigation userType={userProfile?.tipo} />
    </View>
  );
}
