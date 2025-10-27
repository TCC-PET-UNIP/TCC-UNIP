import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AdotanteQuestionario } from "../types/types";
import axios from "axios";

export default function AdotanteQuestions() {
  const [respostas, setRespostas] = useState<AdotanteQuestionario>({
    tipo_imovel: "",
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
    gastos_mensais: "",
    exp_previa_especie: "",
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
      // Recupera dados do registro
      const registerDataStr = await AsyncStorage.getItem(
        "register_adotante_data"
      );
      if (!registerDataStr) {
        Alert.alert(
          "Erro",
          "Dados do registro não encontrados. Volte e preencha o cadastro."
        );
        return;
      }
      const registerData = JSON.parse(registerDataStr);

      // Monta o vetor de características conforme especificação do backend
      // Os campos agora são coletados no formulário: gastos_mensais e exp_previa_especie.
      // Map functions: options now supply numeric strings matching backend codes.
      const toInt = (v: string, fallback = 0) => {
        const n = parseInt(v, 10);
        return isNaN(n) ? fallback : n;
      };

      const mapTipoImovel = (v: string) => toInt(v, 3); // 1..5
      const mapAreaExterna = (v: string) => toInt(v, 0); // 1 or 0
      const mapImovelTelado = (v: string) => toInt(v, 0); // 1 or 0
      const mapQtdMoradores = (v: string) => toInt(v, 1); // integer
      const mapBinarioSimNao = (v: string) => toInt(v, 0); // 1 or 0
      const mapPresencaOutrosAnimais = (v: string) => toInt(v, 0); // 1 or 0
      const mapExperiencia = (v: string) => toInt(v, 3); // 1..5
      const mapTempoDiario = (v: string) => toInt(v, 3); // 1..5
      const mapTempoFora = (v: string) => toInt(v, 3); // 1..5
      const mapAceitaNecessidades = (v: string) => toInt(v, 0); // 1 or 0
      const mapGastosMensais = (v: string) => toInt(v, 3); // 1,3,5
      const mapExpPrevia = (v: string) => toInt(v, 0); // 1 or 0

      const vetor_caracteristicas: number[] = [
        mapTipoImovel(respostas.tipo_imovel), // 0
        mapAreaExterna(respostas.possui_area_externa), // 1
        mapImovelTelado(respostas.imovel_telado), // 2
        mapQtdMoradores(respostas.quantidade_moradores), // 3
        mapBinarioSimNao(respostas.ha_criancas), // 4
        mapBinarioSimNao(respostas.ha_idosos), // 5
        mapPresencaOutrosAnimais(respostas.presenca_outros_animais), // 6
        mapExperiencia(respostas.experiencia_animais), // 7
        mapTempoDiario(respostas.tempo_diario_disponivel), // 8
        mapTempoFora(respostas.tempo_fora_casa), // 9
        mapAceitaNecessidades(respostas.aceita_necessidades_especiais), // 10
        mapGastosMensais(respostas.gastos_mensais || "medio"), // 11
        mapExpPrevia(respostas.exp_previa_especie || "nao"), // 12
      ];

      // Junta dados de registro com o vetor no formato esperado pelo backend
      const payload = {
        ...registerData,
        vetor_caracteristicas,
      };

      // LOG: vetor montado — útil para depuração/validação antes do envio
      console.log(
        "[AdotanteQuestions] vetor_caracteristicas:",
        vetor_caracteristicas
      );

      // Envia para o backend
      // Faz requisição POST com o payload correto (não depende de services/apiConfig)
      const resp = await axios.post(
        "http://localhost:8000/server/register_adopter",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const { user, access, refresh } = resp.data;
      if (access && refresh && user) {
        const userProfile = {
          id: user.id || user.adotante?.id || null,
          email: "",
          tipo: "ADOTANTE",
          data_cadastro: new Date(),
          nome: user.nome || user.adotante?.nome,
          idade: user.idade || user.adotante?.idade,
          telefone: user.telefone || user.adotante?.telefone,
          endereco: user.endereco || user.adotante?.endereco || null,
        };
        // Salva tokens e perfil localmente sem depender de apiConfig
        try {
          await AsyncStorage.setItem("access_token", String(access));
          await AsyncStorage.setItem("refresh_token", String(refresh));
          await AsyncStorage.setItem(
            "user_profile",
            JSON.stringify(userProfile)
          );
        } catch (e) {
          console.warn("Erro ao salvar auth no AsyncStorage:", e);
        }
        await AsyncStorage.removeItem("register_adotante_data");
        Alert.alert("Sucesso", "Cadastro realizado com sucesso!", [
          { text: "OK", onPress: () => router.replace("/home") },
        ]);
      } else {
        Alert.alert("Erro", "Resposta inválida do servidor");
      }
    } catch (error) {
      console.error("Erro ao cadastrar adotante:", error);
      Alert.alert("Erro", "Erro ao cadastrar adotante. Tente novamente.");
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
            <Text className="text-2xl font-bold text-[#ad3434] mb-2 text-center">
              Questionário
            </Text>
            <Text className="text-base text-[#B87B56] mb-6 text-center">
              Conte-nos sobre você e sua casa
            </Text>
            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Tipo de imóvel:
              </Text>
              {renderSelector("tipo_imovel", [
                { label: "Apartamento (pequeno)", value: "1" },
                { label: "Apartamento (grande)", value: "2" },
                { label: "Casa", value: "3" },
                { label: "Casa com quintal grande", value: "4" },
                { label: "Chácara/Sítio", value: "5" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Possui área externa:
              </Text>
              {renderSelector("possui_area_externa", [
                { label: "Sim", value: "1" },
                { label: "Não", value: "0" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Imóvel é telado?
              </Text>
              {renderSelector("imovel_telado", [
                { label: "Sim", value: "1" },
                { label: "Não", value: "0" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Quantidade de moradores:
              </Text>
              {renderSelector("quantidade_moradores", [
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4", value: "4" },
                { label: "5 ou mais", value: "5" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Há crianças? (0 a 12 anos)
              </Text>
              {renderSelector("ha_criancas", [
                { label: "Sim", value: "1" },
                { label: "Não", value: "0" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">Há idosos?</Text>
              {renderSelector("ha_idosos", [
                { label: "Sim", value: "1" },
                { label: "Não", value: "0" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Presença de outros animais:
              </Text>
              {renderSelector("presenca_outros_animais", [
                { label: "Sim", value: "1" },
                { label: "Não", value: "0" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Tem experiência com animais?
              </Text>
              {renderSelector("experiencia_animais", [
                { label: "1 - Iniciante/Nenhuma", value: "1" },
                { label: "2 - Pouca", value: "2" },
                { label: "3 - Média", value: "3" },
                { label: "4 - Experiente", value: "4" },
                { label: "5 - Muito experiente", value: "5" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Tempo diário disponível:
              </Text>
              {renderSelector("tempo_diario_disponivel", [
                { label: "1 - Muito pouco", value: "1" },
                { label: "2 - Pouco", value: "2" },
                { label: "3 - Moderado", value: "3" },
                { label: "4 - Bastante", value: "4" },
                { label: "5 - Muito tempo", value: "5" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Tempo fora de casa (trabalho/estudo):
              </Text>
              {renderSelector("tempo_fora_casa", [
                { label: "1 - Quase nunca", value: "1" },
                { label: "2 - Poucas horas", value: "2" },
                { label: "3 - Período de trabalho padrão", value: "3" },
                { label: "4 - Longo período", value: "4" },
                { label: "5 - Maior parte do dia", value: "5" },
              ])}
            </View>

            <View className="w-full mb-6">
              <Text className="text-[#B87B56] font-bold mb-2">
                Aceita animais com necessidades especiais?
              </Text>
              {renderSelector("aceita_necessidades_especiais", [
                { label: "Sim", value: "1" },
                { label: "Não", value: "0" },
              ])}
            </View>

            <View className="w-full mb-4">
              <Text className="text-[#B87B56] font-bold mb-2">
                Gastos mensais estimados com pet
              </Text>
              {renderSelector("gastos_mensais", [
                { label: "Baixo", value: "1" },
                { label: "Médio", value: "3" },
                { label: "Alto", value: "5" },
              ])}
            </View>

            <View className="w-full mb-6">
              <Text className="text-[#B87B56] font-bold mb-2">
                Já teve experiência prévia com esta espécie?
              </Text>
              {renderSelector("exp_previa_especie", [
                { label: "Sim", value: "1" },
                { label: "Não", value: "0" },
              ])}
            </View>

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
