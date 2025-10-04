import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AdotanteQuestionario } from "../types/types";

export default function AdotanteQuestions() {
  const [respostas, setRespostas] = useState<AdotanteQuestionario>({
    tipo_imovel: "",
    localizacao: "",
    possui_area_externa: "",
    imovel_telado: "",
    quantidade_moradores: "",
    ha_criancas: "",
    ha_idosos: "",
    presenca_outros_animais: "",
    experiencia_animais: "",
    tempo_diario_disponivel: "",
    tempo_fora_casa: "",
    aceita_necessidades_especiais: "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<
    keyof AdotanteQuestionario | null
  >(null);
  const [currentOptions, setCurrentOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const handleSelectOption = (
    field: keyof AdotanteQuestionario,
    value: string
  ) => {
    setRespostas((prev) => ({ ...prev, [field]: value }));
  };

  const openModal = (
    field: keyof AdotanteQuestionario,
    options: { label: string; value: string }[]
  ) => {
    setCurrentField(field);
    setCurrentOptions(options);
    setModalVisible(true);
  };

  const selectOption = (option: { label: string; value: string }) => {
    if (currentField) {
      handleSelectOption(currentField, option.value);
    }
    setModalVisible(false);
  };

  const getSelectedLabel = (
    field: keyof AdotanteQuestionario,
    options: { label: string; value: string }[]
  ) => {
    const selectedOption = options.find(
      (option) => option.value === respostas[field]
    );
    return selectedOption ? selectedOption.label : "Selecione";
  };

  const isFormValid = () => {
    return Object.values(respostas).every((resposta) => resposta !== "");
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert("Atenção", "Por favor, responda todas as perguntas.");
      return;
    }

    try {
      await AsyncStorage.setItem(
        "questionario_adotante",
        JSON.stringify(respostas)
      );
      Alert.alert(
        "Questionário Concluído",
        "Suas respostas foram salvas com sucesso!",
        [{ text: "OK", onPress: () => router.replace("/home") }]
      );
    } catch (error) {
      console.error("Erro ao salvar questionário:", error);
      Alert.alert("Erro", "Erro ao salvar suas respostas. Tente novamente.");
    }
  };

  const renderSelector = (
    field: keyof AdotanteQuestionario,
    options: { label: string; value: string }[]
  ) => (
    <TouchableOpacity
      className="w-full bg-[#F8F3EC] border border-[#B87B56] rounded-lg px-4 py-3 flex-row justify-between items-center"
      onPress={() => openModal(field, options)}
    >
      <Text
        className={`text-base font-semibold ${
          respostas[field] ? "text-[#B87B56]" : "text-[#B87B56]/50"
        }`}
      >
        {getSelectedLabel(field, options)}
      </Text>
      <Feather name="chevron-down" size={20} color="#B87B56" />
    </TouchableOpacity>
  );

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
            {/* Título */}
            <Text className="text-2xl font-bold text-[#ad3434] mb-2 text-center">
              Questionário
            </Text>
            <Text className="text-base text-[#B87B56] mb-6 text-center">
              Conte-nos sobre você e sua casa
            </Text>

            {/* Tipo de imóvel */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Tipo de imóvel:
              </Text>
              {renderSelector("tipo_imovel", [
                { label: "Casa", value: "casa" },
                { label: "Apartamento", value: "apartamento" },
                { label: "Chácara/Sítio", value: "chacara/sitio" },
                { label: "Outro", value: "outro" },
              ])}
            </View>

            {/* Localização */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Localização (permissão para pets):
              </Text>
              {renderSelector("localizacao", [
                { label: "Sim, totalmente permitido", value: "permitido" },
                { label: "Sim, com algumas restrições", value: "restricoes" },
                { label: "Não tenho certeza", value: "incerto" },
                { label: "Não é permitido", value: "nao_permitido" },
              ])}
            </View>

            {/* Área externa */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Possui área externa:
              </Text>
              {renderSelector("possui_area_externa", [
                { label: "Sim, quintal grande", value: "quintal_grande" },
                { label: "Sim, quintal pequeno", value: "quintal_pequeno" },
                { label: "Sim, varanda/sacada", value: "varanda" },
                { label: "Não possui", value: "nao_possui" },
              ])}
            </View>

            {/* Imóvel telado */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Imóvel é telado?
              </Text>
              {renderSelector("imovel_telado", [
                { label: "Sim, totalmente telado", value: "totalmente" },
                { label: "Parcialmente telado", value: "parcialmente" },
                { label: "Não é telado", value: "nao_telado" },
              ])}
            </View>

            {/* Quantidade de moradores */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Quantidade de moradores:
              </Text>
              {renderSelector("quantidade_moradores", [
                { label: "Moro sozinho(a)", value: "1" },
                { label: "2 pessoas", value: "2" },
                { label: "3 pessoas", value: "3" },
                { label: "4 pessoas", value: "4" },
                { label: "Mais de 4 pessoas", value: "mais_4" },
              ])}
            </View>

            {/* Há crianças */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Há crianças? (0 a 12 anos)
              </Text>
              {renderSelector("ha_criancas", [
                { label: "Sim", value: "sim" },
                { label: "Não", value: "nao" },
              ])}
            </View>

            {/* Há idosos */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">Há idosos?</Text>
              {renderSelector("ha_idosos", [
                { label: "Sim", value: "sim" },
                { label: "Não", value: "nao" },
              ])}
            </View>

            {/* Outros animais */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Presença de outros animais:
              </Text>
              {renderSelector("presenca_outros_animais", [
                { label: "Sim, tenho cães", value: "caes" },
                { label: "Sim, tenho gatos", value: "gatos" },
                { label: "Sim, tenho outros animais", value: "outros" },
                { label: "Não tenho animais", value: "nenhum" },
              ])}
            </View>

            {/* Experiência com animais */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Tem experiência com animais?
              </Text>
              {renderSelector("experiencia_animais", [
                { label: "Muita experiência", value: "muita" },
                { label: "Alguma experiência", value: "alguma" },
                { label: "Pouca experiência", value: "pouca" },
                { label: "Nenhuma experiência", value: "nenhuma" },
              ])}
            </View>

            {/* Tempo disponível */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Tempo diário disponível:
              </Text>
              {renderSelector("tempo_diario_disponivel", [
                { label: "Mais de 6 horas", value: "mais_6h" },
                { label: "4 a 6 horas", value: "4_6h" },
                { label: "2 a 4 horas", value: "2_4h" },
                { label: "Menos de 2 horas", value: "menos_2h" },
              ])}
            </View>

            {/* Tempo fora de casa */}
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Tempo fora de casa (trabalho/estudo):
              </Text>
              {renderSelector("tempo_fora_casa", [
                { label: "Menos de 4 horas", value: "menos_4h" },
                { label: "4 a 8 horas", value: "4_8h" },
                { label: "8 a 12 horas", value: "8_12h" },
                { label: "Mais de 12 horas", value: "mais_12h" },
              ])}
            </View>

            {/* Necessidades especiais */}
            <View className="w-full mb-6">
              <Text className="text-[#B87B56] font-bold mb-2">
                Aceita animais com necessidades especiais?
              </Text>
              {renderSelector("aceita_necessidades_especiais", [
                { label: "Sim, sem problemas", value: "sim_sem_problemas" },
                { label: "Sim, dependendo do caso", value: "sim_dependendo" },
                { label: "Talvez, preciso saber mais", value: "talvez" },
                { label: "Não", value: "nao" },
              ])}
            </View>

            {/* Botão Próximo */}
            <TouchableOpacity
              className={`w-full py-3 rounded-lg ${
                isFormValid() ? "bg-[#8DC6CE]" : "bg-gray-400"
              }`}
              onPress={handleSubmit}
              disabled={!isFormValid()}
              style={{ opacity: !isFormValid() ? 0.7 : 1 }}
            >
              <Text className="text-white text-center font-bold text-base">
                PRÓXIMO
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de seleção */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            className="bg-white rounded-t-3xl p-6"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">
                Selecione uma opção
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-80">
              {currentOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className="py-4 px-2 border-b border-gray-100"
                  onPress={() => selectOption(option)}
                >
                  <Text className="text-base text-gray-800">
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
