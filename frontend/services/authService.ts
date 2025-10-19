import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LoginRequest,
  LoginResponse,
  RegisterAdotanteRequest,
  RegisterONGRequest,
  UserProfile,
} from "../types/types";
import {
  isValidEmail,
  isValidPassword,
  isValidCNPJ,
  isValidCEP,
  isValidPhone,
  isValidUF,
  isValidAddress,
  isNotEmpty,
} from "../utils/validators";
import API_CONFIG, { apiRequest } from "./apiConfig";

class AuthService {
  // Login com integração ao backend
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Validações básicas antes de fazer a requisição
      if (!credentials.email || !credentials.senha) {
        return {
          success: false,
          message: "Email e senha são obrigatórios",
        };
      }

      if (!isValidEmail(credentials.email)) {
        return {
          success: false,
          message: "Email inválido",
        };
      }

      if (!isValidPassword(credentials.senha)) {
        return {
          success: false,
          message: "Senha deve ter pelo menos 6 caracteres",
        };
      }

      // Fazer requisição ao backend
      const response = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email,
          senha: credentials.senha,
        }),
        // Não enviar header Authorization em rotas públicas
        omitAuth: true,
      });

      // Processar resposta do backend
      const { user, access, refresh } = response;

      // Determinar tipo de usuário e construir perfil
      const userProfile: UserProfile = this.buildUserProfile(user);

      // Salvar dados no AsyncStorage
      await AsyncStorage.setItem("userToken", access);
      await AsyncStorage.setItem("refreshToken", refresh);
      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

      return {
        success: true,
        message: "Login realizado com sucesso",
        user: userProfile,
        access,
        refresh,
      };
    } catch (error: any) {
      console.error("Erro no login:", error);
      return {
        success: false,
        message: error.message || "Erro ao realizar login",
      };
    }
  }

  // Cadastro de adotante com integração ao backend
  async registerAdotante(
    data: RegisterAdotanteRequest
  ): Promise<LoginResponse> {
    try {
      // Validações
      const validation = this.validateRegistration(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      // Preparar dados para o backend
      const requestData = {
        conta: {
          email: data.conta.email,
          senha: data.conta.senha,
        },
        nome: data.nome,
        idade: data.idade.toString(),
        telefone: data.telefone,
        vetor_caracteristicas: [1, 1, 1, 1, 1], // Valor padrão por enquanto
        endereco: {
          logradouro: data.endereco.logradouro,
          numero: data.endereco.numero,
          bairro: data.endereco.bairro,
          cidade: data.endereco.cidade,
          uf: data.endereco.uf,
          cep: data.endereco.cep,
        },
      };

      // Fazer requisição ao backend
      const response = await apiRequest(API_CONFIG.ENDPOINTS.REGISTER_ADOPTER, {
        method: "POST",
        body: JSON.stringify(requestData),
        // Não enviar header Authorization em rotas públicas
        omitAuth: true,
      });

      // Processar resposta
      const { user, access, refresh } = response;
      const userProfile: UserProfile = this.buildUserProfile({
        adotante: user,
        ong: null,
      });

      // Salvar dados
      await AsyncStorage.setItem("userToken", access);
      await AsyncStorage.setItem("refreshToken", refresh);
      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

      return {
        success: true,
        message: "Cadastro realizado com sucesso",
        user: userProfile,
        access,
        refresh,
      };
    } catch (error: any) {
      console.error("Erro no cadastro de adotante:", error);
      return {
        success: false,
        message: error.message || "Erro ao realizar cadastro",
      };
    }
  }

  // Cadastro de ONG com integração ao backend
  async registerONG(data: RegisterONGRequest): Promise<LoginResponse> {
    try {
      // Validações
      const validation = this.validateRegistration(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      // Validar CNPJ
      if (!isValidCNPJ(data.cnpj)) {
        return {
          success: false,
          message: "CNPJ inválido",
        };
      }

      // Preparar dados para o backend
      const requestData = {
        conta: {
          email: data.conta.email,
          senha: data.conta.senha,
        },
        nome_fantasia: data.nome_fantasia,
        cnpj: data.cnpj,
        telefone: data.telefone,
        endereco: {
          logradouro: data.endereco.logradouro,
          numero: data.endereco.numero,
          bairro: data.endereco.bairro,
          cidade: data.endereco.cidade,
          uf: data.endereco.uf,
          cep: data.endereco.cep,
        },
      };

      // Fazer requisição ao backend
      const response = await apiRequest(API_CONFIG.ENDPOINTS.REGISTER_ONG, {
        method: "POST",
        body: JSON.stringify(requestData),
        // Não enviar header Authorization em rotas públicas
        omitAuth: true,
      });

      // Processar resposta
      const { user, access, refresh } = response;
      const userProfile: UserProfile = this.buildUserProfile({
        ong: user,
        adotante: null,
      });

      // Salvar dados
      await AsyncStorage.setItem("userToken", access);
      await AsyncStorage.setItem("refreshToken", refresh);
      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

      return {
        success: true,
        message: "Cadastro realizado com sucesso",
        user: userProfile,
        access,
        refresh,
      };
    } catch (error: any) {
      console.error("Erro no cadastro de ONG:", error);
      return {
        success: false,
        message: error.message || "Erro ao realizar cadastro",
      };
    }
  }

  // Helper para construir UserProfile a partir da resposta do backend
  private buildUserProfile(userData: any): UserProfile {
    if (userData.ong) {
      // É uma ONG
      return {
        id: userData.ong.id,
        email: "", // Email não vem na resposta, mas está no token
        tipo: "ONG",
        data_cadastro: new Date(),
        nome_fantasia: userData.ong.nome_fantasia,
        cnpj: userData.ong.cnpj,
        telefone: userData.ong.telefone,
        endereco: {
          id: userData.ong.endereco.id,
          logradouro: userData.ong.endereco.logradouro,
          numero: userData.ong.endereco.numero,
          bairro: userData.ong.endereco.bairro,
          cidade: userData.ong.endereco.cidade,
          uf: userData.ong.endereco.uf,
          cep: userData.ong.endereco.cep,
        },
      };
    } else if (userData.adotante) {
      // É um adotante
      return {
        id: userData.adotante.id,
        email: "", // Email não vem na resposta
        tipo: "ADOTANTE",
        data_cadastro: new Date(),
        nome: userData.adotante.nome,
        idade: userData.adotante.idade,
        telefone: userData.adotante.telefone,
        endereco: {
          id: userData.adotante.endereco.id,
          logradouro: userData.adotante.endereco.logradouro,
          numero: userData.adotante.endereco.numero,
          bairro: userData.adotante.endereco.bairro,
          cidade: userData.adotante.endereco.cidade,
          uf: userData.adotante.endereco.uf,
          cep: userData.adotante.endereco.cep,
        },
      };
    }

    throw new Error("Formato de usuário inválido");
  }

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      "userToken",
      "refreshToken",
      "userProfile",
    ]);
  }

  // Verificar se usuário está logado
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem("userToken");
      return !!token;
    } catch {
      return false;
    }
  }

  // Obter perfil do usuário
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem("userProfile");
      return profileData ? JSON.parse(profileData) : null;
    } catch {
      return null;
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(updatedProfile: UserProfile): Promise<void> {
    try {
      // Por enquanto, apenas atualizar no AsyncStorage
      // TODO: Implementar rota de atualização no backend
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    } catch (error) {
      throw new Error("Erro ao atualizar perfil");
    }
  }

  // Verificar saúde do backend
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiRequest(API_CONFIG.ENDPOINTS.HEALTH, {
        method: "GET",
      });
      return response.status === "ok";
    } catch {
      return false;
    }
  }

  // Validações comuns
  private validateRegistration(data: any): {
    isValid: boolean;
    message: string;
  } {
    if (!data.conta?.email || !data.conta?.senha) {
      return {
        isValid: false,
        message: "Email e senha são obrigatórios",
      };
    }

    if (!isValidEmail(data.conta.email)) {
      return { isValid: false, message: "Email inválido" };
    }

    if (!isValidPassword(data.conta.senha)) {
      return {
        isValid: false,
        message: "Senha deve ter pelo menos 6 caracteres",
      };
    }

    if (!isValidPhone(data.telefone)) {
      return { isValid: false, message: "Telefone inválido" };
    }

    // Validar endereço
    const { endereco } = data;
    if (!isValidAddress(endereco)) {
      return {
        isValid: false,
        message: "Todos os campos do endereço são obrigatórios",
      };
    }

    if (!isValidUF(endereco.uf)) {
      return { isValid: false, message: "UF deve ter 2 caracteres" };
    }

    if (!isValidCEP(endereco.cep)) {
      return { isValid: false, message: "CEP inválido" };
    }

    return { isValid: true, message: "" };
  }
}

export default new AuthService();
