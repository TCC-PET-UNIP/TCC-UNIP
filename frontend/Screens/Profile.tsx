import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import BottomNavigation from "../components/BottomNavigation";
import {
  isValidEmail,
  isValidAge,
  isValidCEP,
  isValidUF,
} from "../utils/validators";
import {
  formatPhone,
  formatCEP,
  formatCNPJ,
  removeFormatting,
} from "../utils/formatters";

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Theme / constants
  const THEME_COLOR = "#B87B56";
  const INPUT_BASE = "border-2 rounded-xl px-4 py-3 text-amber-700";
  const INPUT_EDIT = "border-amber-300 bg-white";
  const INPUT_READONLY = "border-gray-200 bg-gray-50";

  // Estados para os campos editáveis
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [idade, setIdade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profileImage, setProfileImage] = useState<{ uri: string } | null>(
    null
  );

  // Snapshot of original values to detect changes
  const originalSnapshotRef = useRef<string | null>(null);

  const inputClass = (editing: boolean) =>
    `${INPUT_BASE} ${editing ? INPUT_EDIT : INPUT_READONLY}`;

  // Estados para endereço
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const isLoggedIn = await authService.isLoggedIn();
      if (!isLoggedIn) {
        router.replace("/login");
        return;
      }

      const profile = await authService.getUserProfile();
      setUserProfile(profile);

      if (profile) {
        populateFields(profile);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      Alert.alert("Erro", "Não foi possível carregar o perfil do usuário.");
    } finally {
      setLoading(false);
    }
  };

  const pickFromCamera = useCallback(async () => {
    const picked = await ImagePickerHelper.pickFromCamera();
    if (picked) setProfileImage(picked);
  }, []);

  const pickFromGallery = useCallback(async () => {
    const picked = await ImagePickerHelper.pickFromGallery();
    if (picked) setProfileImage(picked);
  }, []);

  const handleImagePicker = useCallback(() => {
    ImagePickerHelper.showImagePickerOptions(pickFromCamera, pickFromGallery);
  }, [pickFromCamera, pickFromGallery]);

  const populateFields = (profile: UserProfile) => {
    setEmail(profile.email);
    setNome(profile.nome || "");
    setNomeFantasia(profile.nome_fantasia || "");
    setCnpj(profile.cnpj || "");
    setIdade(profile.idade?.toString() || "");
    setTelefone(profile.telefone);

    setLogradouro(profile.endereco.logradouro);
    setNumero(profile.endereco.numero);
    setBairro(profile.endereco.bairro);
    setCidade(profile.endereco.cidade);
    setUf(profile.endereco.uf);
    setCep(profile.endereco.cep);

    // If the profile includes an image (common keys used across the app), use it
    const maybeImage =
      (profile as any).foto ||
      (profile as any).ong_foto ||
      (profile as any).logo ||
      (profile as any).imagem ||
      (profile as any).foto_url ||
      (profile as any).image;
    if (maybeImage) {
      // normalize string -> { uri }
      const normalized =
        typeof maybeImage === "string" ? { uri: maybeImage } : maybeImage;
      setProfileImage(normalized);
    }

    // store a minimal snapshot for change detection
    const snapshot = {
      email: profile.email || "",
      nome: profile.nome || "",
      nomeFantasia: profile.nome_fantasia || "",
      cnpj: profile.cnpj || "",
      idade: profile.idade?.toString() || "",
      telefone: profile.telefone || "",
      endereco: {
        logradouro: profile.endereco.logradouro || "",
        numero: profile.endereco.numero || "",
        bairro: profile.endereco.bairro || "",
        cidade: profile.endereco.cidade || "",
        uf: profile.endereco.uf || "",
        cep: profile.endereco.cep || "",
      },
      imageUri: maybeImage
        ? typeof maybeImage === "string"
          ? maybeImage
          : maybeImage.uri || null
        : null,
    };
    originalSnapshotRef.current = JSON.stringify(snapshot);
  };

  const hasChanges = useMemo(() => {
    if (!userProfile || !originalSnapshotRef.current) return false;

    const current = {
      email: email || "",
      nome: nome || "",
      nomeFantasia: nomeFantasia || "",
      cnpj: cnpj || "",
      idade: idade || "",
      telefone: telefone || "",
      endereco: {
        logradouro: logradouro || "",
        numero: numero || "",
        bairro: bairro || "",
        cidade: cidade || "",
        uf: uf || "",
        cep: cep || "",
      },
      imageUri: profileImage ? profileImage.uri || null : null,
    };

    return JSON.stringify(current) !== originalSnapshotRef.current;
  }, [
    email,
    nome,
    nomeFantasia,
    cnpj,
    idade,
    telefone,
    logradouro,
    numero,
    bairro,
    cidade,
    uf,
    cep,
    profileImage,
    userProfile,
  ]);

  const handleSave = async () => {
    if (!userProfile) return;

    try {
      setSaving(true);

      // Validações básicas
      if (!email.trim()) {
        Alert.alert("Erro", "Email é obrigatório");
        return;
      }

      if (userProfile.tipo === "ADOTANTE" && !nome.trim()) {
        Alert.alert("Erro", "Nome é obrigatório");
        return;
      }

      if (userProfile.tipo === "ONG" && !nomeFantasia.trim()) {
        Alert.alert("Erro", "Nome fantasia é obrigatório");
        return;
      }

      if (userProfile.tipo === "ONG" && !cnpj.trim()) {
        Alert.alert("Erro", "CNPJ é obrigatório");
        return;
      }

      if (!telefone.trim()) {
        Alert.alert("Erro", "Telefone é obrigatório");
        return;
      }

      // Validar endereço
      if (
        !logradouro.trim() ||
        !numero.trim() ||
        !bairro.trim() ||
        !cidade.trim() ||
        !uf.trim() ||
        !cep.trim()
      ) {
        Alert.alert("Erro", "Todos os campos de endereço são obrigatórios");
        return;
      }

      // Validar formato do email
      if (!isValidEmail(email)) {
        Alert.alert("Erro", "Formato de email inválido");
        return;
      }

      // Validar idade para adotantes
      if (userProfile.tipo === "ADOTANTE" && idade) {
        if (!isValidAge(parseInt(idade))) {
          Alert.alert("Erro", "Idade deve ser um número entre 18 e 100 anos");
          return;
        }
      }

      // Validar CEP
      if (!isValidCEP(cep)) {
        Alert.alert("Erro", "CEP deve ter 8 dígitos");
        return;
      }

      // Validar UF
      if (!isValidUF(uf)) {
        Alert.alert("Erro", "UF deve ter 2 caracteres");
        return;
      }

      // Criar objeto de perfil atualizado
      const updatedProfile: UserProfile = {
        ...userProfile,
        email: email.toLowerCase().trim(),
        nome: userProfile.tipo === "ADOTANTE" ? nome.trim() : undefined,
        nome_fantasia:
          userProfile.tipo === "ONG" ? nomeFantasia.trim() : undefined,
        idade:
          userProfile.tipo === "ADOTANTE" && idade
            ? parseInt(idade)
            : undefined,
        telefone: formatPhone(telefone),
        endereco: {
          ...userProfile.endereco,
          logradouro: logradouro.trim(),
          numero: numero.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          uf: uf.toUpperCase().trim(),
          cep: formatCEP(removeFormatting(cep)),
        },
      };

      // Simular salvamento (substituir por chamada à API)
      await authService.updateProfile(updatedProfile);

      setUserProfile(updatedProfile);
      // Re-populate fields and refresh original snapshot so 'hasChanges' becomes false
      populateFields(updatedProfile);
      setIsEditing(false);

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      populateFields(userProfile);
    }
    setIsEditing(false);
  };

  const handleTelefoneChange = useCallback((text: string) => {
    setTelefone(formatPhone(text));
  }, []);

  const handleCEPChange = useCallback((text: string) => {
    const cleaned = removeFormatting(text);
    if (cleaned.length <= 8) {
      setCep(cleaned.length === 8 ? formatCEP(cleaned) : cleaned);
    }
  }, []);

  const handleCNPJChange = useCallback((text: string) => {
    const cleaned = removeFormatting(text);
    if (cleaned.length <= 14) {
      setCnpj(cleaned.length === 14 ? formatCNPJ(cleaned) : cleaned);
    }
  }, []);

  if (loading) {
    return (
      <View className="loading-container">
        <ActivityIndicator size="large" color={THEME_COLOR} />
        <Text className="loading-text">Carregando perfil...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View className="loading-container">
        <Feather name="user-x" size={48} color="#B87B56" />
        <Text className="loading-text">Erro ao carregar perfil</Text>
        <TouchableOpacity
          className="bg-amber-300 px-6 py-3 rounded-xl mt-4"
          onPress={loadUserProfile}
        >
          <Text className="text-pethelper-primary font-semibold">
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="container-pethelper"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-5 pb-6 bg-amber-700/10">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-red-800 mb-1">
                Meu Perfil
              </Text>
              <Text className="text-pethelper-primary">
                {userProfile.tipo === "ADOTANTE" ? "Adotante" : "ONG"}
              </Text>
            </View>
            <View className="flex-row">
              {isEditing ? (
                <>
                  <TouchableOpacity
                    className="bg-gray-400 p-3 rounded-xl mr-2"
                    onPress={handleCancel}
                    disabled={saving}
                  >
                    <Feather name="x" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`p-3 rounded-xl ${hasChanges && !saving ? "bg-amber-300" : "bg-gray-300"}`}
                    onPress={handleSave}
                    disabled={saving || !hasChanges}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={THEME_COLOR} />
                    ) : (
                      <Feather
                        name="check"
                        size={20}
                        color={hasChanges ? THEME_COLOR : "white"}
                      />
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  className="bg-amber p-3 rounded-xl"
                  onPress={() => setIsEditing(true)}
                >
                  <Feather name="edit-3" size={20} color="#B87B56" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View className="px-6 pb-24">
          {/* Foto de Perfil - Apenas para ONGs */}
          {userProfile.tipo === "ONG" && (
            <View className="bg-pethelper-card rounded-pethelper spacing-pethelper margin-pethelper shadow-pethelper">
              <Text className="text-lg font-semibold text-red-800 mb-4">
                Foto de Perfil
              </Text>

              <View className="items-center">
                <View className="relative">
                  <View className="w-32 h-32 rounded-full bg-amber-100 items-center justify-center overflow-hidden border-2 border-amber-200">
                    {profileImage ? (
                      <Image
                        source={profileImage}
                        style={{ width: 128, height: 128 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center justify-center">
                        <Feather name="home" size={48} color="#B87B56" />
                        <Text className="text-amber-700 text-sm mt-2 text-center">
                          Logo da ONG
                        </Text>
                      </View>
                    )}
                  </View>

                  {isEditing && (
                    <TouchableOpacity
                      className="absolute -bottom-2 -right-2 bg-amber-300 p-2 rounded-full border-2 border-white"
                      onPress={handleImagePicker}
                    >
                      <Feather name="camera" size={16} color="#B87B56" />
                    </TouchableOpacity>
                  )}
                </View>

                {!profileImage && !isEditing && (
                  <Text className="text-amber-600 text-sm mt-3 text-center">
                    Adicione uma foto para que os adotantes conheçam melhor sua
                    ONG
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Informações Básicas */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-red-800 mb-4">
              {userProfile.tipo === "ADOTANTE"
                ? "Informações Pessoais"
                : "Dados da ONG"}
            </Text>

            {/* Nome ou Nome Fantasia */}
            <View className="mb-4">
              <Text className="text-amber-700 font-medium mb-2">
                {userProfile.tipo === "ADOTANTE"
                  ? "Nome Completo"
                  : "Nome Fantasia"}
              </Text>
              <TextInput
                className={inputClass(isEditing)}
                value={userProfile.tipo === "ADOTANTE" ? nome : nomeFantasia}
                onChangeText={
                  userProfile.tipo === "ADOTANTE" ? setNome : setNomeFantasia
                }
                editable={isEditing}
                placeholder={
                  userProfile.tipo === "ADOTANTE"
                    ? "Seu nome completo"
                    : "Nome da ONG"
                }
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-pethelper-primary font-medium mb-2">
                Email
              </Text>
              <TextInput
                className={inputClass(isEditing)}
                value={email}
                onChangeText={setEmail}
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="seu@email.com"
              />
            </View>

            {/* Campos específicos por tipo */}
            {userProfile.tipo === "ADOTANTE" && (
              <View className="mb-4">
                <Text className="text-amber-700 font-medium mb-2">Idade</Text>
                <TextInput
                  className={inputClass(isEditing)}
                  value={idade}
                  onChangeText={setIdade}
                  editable={isEditing}
                  keyboardType="numeric"
                  placeholder="Sua idade"
                />
              </View>
            )}

            {userProfile.tipo === "ONG" && (
              <View className="mb-4">
                <Text className="text-amber-700 font-medium mb-2">CNPJ</Text>
                <TextInput
                  className={inputClass(isEditing)}
                  value={cnpj}
                  onChangeText={handleCNPJChange}
                  editable={isEditing}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </View>
            )}

            {/* Telefone */}
            <View>
              <Text className="text-amber-700 font-medium mb-2">Telefone</Text>
              <TextInput
                className={inputClass(isEditing)}
                value={telefone}
                onChangeText={handleTelefoneChange}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </View>
          </View>

          {/* Endereço */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-red-800 mb-4">
              Endereço
            </Text>

            {/* Logradouro e Número */}
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-amber-700 font-medium mb-2">
                  Logradouro
                </Text>
                <TextInput
                  className={inputClass(isEditing)}
                  value={logradouro}
                  onChangeText={setLogradouro}
                  editable={isEditing}
                  placeholder="Rua, Avenida..."
                />
              </View>
              <View className="w-20">
                <Text className="text-amber-700 font-medium mb-2">Número</Text>
                <TextInput
                  className={inputClass(isEditing)}
                  value={numero}
                  onChangeText={setNumero}
                  editable={isEditing}
                  placeholder="123"
                />
              </View>
            </View>

            {/* Bairro */}
            <View className="mb-4">
              <Text className="text-amber-700 font-medium mb-2">Bairro</Text>
              <TextInput
                className={inputClass(isEditing)}
                value={bairro}
                onChangeText={setBairro}
                editable={isEditing}
                placeholder="Nome do bairro"
              />
            </View>

            {/* Cidade e UF */}
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-amber-700 font-medium mb-2">Cidade</Text>
                <TextInput
                  className={inputClass(isEditing)}
                  value={cidade}
                  onChangeText={setCidade}
                  editable={isEditing}
                  placeholder="Nome da cidade"
                />
              </View>
              <View className="w-16">
                <Text className="text-amber-700 font-medium mb-2">UF</Text>
                <TextInput
                  className={inputClass(isEditing)}
                  value={uf}
                  onChangeText={(text) => setUf(text.toUpperCase())}
                  editable={isEditing}
                  placeholder="SP"
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* CEP */}
            <View>
              <Text className="text-amber-700 font-medium mb-2">CEP</Text>
              <TextInput
                className={inputClass(isEditing)}
                value={cep}
                onChangeText={handleCEPChange}
                editable={isEditing}
                placeholder="00000-000"
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
          </View>

          {/* Informações da Conta */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-semibold text-red-800 mb-4">
              Informações da Conta
            </Text>

            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-amber-700 font-medium">Tipo de Conta:</Text>
              <Text className="text-red-800 font-semibold">
                {userProfile.tipo === "ADOTANTE" ? "Adotante" : "ONG"}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-amber-700 font-medium">Cadastro em:</Text>
              <Text className="text-red-800">
                {new Date(userProfile.data_cadastro).toLocaleDateString(
                  "pt-BR"
                )}
              </Text>
            </View>

            {/* Estatísticas para ONGs */}
            {userProfile.tipo === "ONG" && (
              <View className="border-t border-amber-200 pt-4">
                <Text className="text-lg font-semibold text-red-800 mb-3">
                  Estatísticas
                </Text>

                <View className="flex-row justify-between mb-2">
                  <View className="flex-1 items-center bg-amber-50 rounded-xl p-3 mr-2">
                    <Text className="text-2xl font-bold text-red-800">0</Text>
                    <Text className="text-amber-700 text-sm text-center">
                      Pets Cadastrados
                    </Text>
                  </View>

                  <View className="flex-1 items-center bg-amber-50 rounded-xl p-3 ml-2">
                    <Text className="text-2xl font-bold text-red-800">0</Text>
                    <Text className="text-amber-700 text-sm text-center">
                      Adoções Realizadas
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomNavigation userType={userProfile.tipo} />
    </KeyboardAvoidingView>
  );
}
