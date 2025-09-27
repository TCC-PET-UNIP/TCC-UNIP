import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LoginRequest,
  LoginResponse,
  RegisterAdotanteRequest,
  RegisterONGRequest,
  UserProfile,
} from "../types/types";

const API_BASE_URL = "http://localhost:8000/api"; // Ajuste conforme necessário

class AuthService {
  // Simular login (substitua por chamada real à API quando o backend estiver pronto)
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validações básicas
      if (!credentials.email || !credentials.senha) {
        return {
          success: false,
          message: "Email e senha são obrigatórios",
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        return {
          success: false,
          message: "Email inválido",
        };
      }

      if (credentials.senha.length < 6) {
        return {
          success: false,
          message: "Senha deve ter pelo menos 6 caracteres",
        };
      }

      // Simular dados de usuário (substituir por chamada real à API)
      const mockUser: UserProfile = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: credentials.email,
        tipo: credentials.email.includes("ong") ? "ONG" : "ADOTANTE",
        data_cadastro: new Date(),
        nome: credentials.email.includes("ong") ? undefined : "João Silva",
        nome_fantasia: credentials.email.includes("ong")
          ? "ONG Amor Animal"
          : undefined,
        cnpj: credentials.email.includes("ong")
          ? "12.345.678/0001-90"
          : undefined,
        idade: credentials.email.includes("ong") ? undefined : 30,
        telefone: "(11) 99999-9999",
        endereco: {
          id: "456e7890-e89b-12d3-a456-426614174001",
          logradouro: "Rua das Flores",
          numero: "123",
          bairro: "Centro",
          cidade: "São Paulo",
          uf: "SP",
          cep: "01234-567",
        },
      };

      // Salvar dados do usuário no AsyncStorage
      await AsyncStorage.setItem("userToken", "mock-token-123");
      await AsyncStorage.setItem("userProfile", JSON.stringify(mockUser));

      return {
        success: true,
        message: "Login realizado com sucesso",
        user: mockUser,
        access: "mock-token-123",
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  // Simular cadastro de adotante
  async registerAdotante(
    data: RegisterAdotanteRequest
  ): Promise<LoginResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Validações
      const validation = this.validateRegistration(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      // Simular criação do usuário
      const newUser: UserProfile = {
        id: this.generateUUID(),
        email: data.conta.email,
        tipo: "ADOTANTE",
        data_cadastro: new Date(),
        nome: data.nome,
        idade: data.idade,
        telefone: data.telefone,
        endereco: {
          id: this.generateUUID(),
          ...data.endereco,
        },
      };

      // Salvar dados
      await AsyncStorage.setItem("userToken", "mock-token-" + Date.now());
      await AsyncStorage.setItem("userProfile", JSON.stringify(newUser));

      return {
        success: true,
        message: "Cadastro realizado com sucesso",
        user: newUser,
        access: "mock-token-" + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro ao realizar cadastro",
      };
    }
  }

  // Simular cadastro de ONG
  async registerONG(data: RegisterONGRequest): Promise<LoginResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Validações
      const validation = this.validateRegistration(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      // Validar CNPJ
      if (!this.isValidCNPJ(data.cnpj)) {
        return {
          success: false,
          message: "CNPJ inválido",
        };
      }

      // Simular criação do usuário
      const newUser: UserProfile = {
        id: this.generateUUID(),
        email: data.conta.email,
        tipo: "ONG",
        data_cadastro: new Date(),
        nome_fantasia: data.nome_fantasia,
        cnpj: data.cnpj,
        telefone: data.telefone,
        endereco: {
          id: this.generateUUID(),
          ...data.endereco,
        },
      };

      // Salvar dados
      await AsyncStorage.setItem("userToken", "mock-token-" + Date.now());
      await AsyncStorage.setItem("userProfile", JSON.stringify(newUser));

      return {
        success: true,
        message: "Cadastro realizado com sucesso",
        user: newUser,
        access: "mock-token-" + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro ao realizar cadastro",
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(["userToken", "userProfile"]);
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
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Em um cenário real, aqui seria feita a chamada para a API
      // const response = await fetch(`${API_BASE_URL}/profile/update`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(updatedProfile)
      // });

      // Para simulação, apenas salvamos no AsyncStorage
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    } catch (error) {
      throw new Error("Erro ao atualizar perfil");
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.conta.email)) {
      return { isValid: false, message: "Email inválido" };
    }

    if (data.conta.senha.length < 6) {
      return {
        isValid: false,
        message: "Senha deve ter pelo menos 6 caracteres",
      };
    }

    if (!data.telefone || data.telefone.length < 10) {
      return { isValid: false, message: "Telefone inválido" };
    }

    // Validar endereço
    const { endereco } = data;
    if (
      !endereco.logradouro ||
      !endereco.numero ||
      !endereco.bairro ||
      !endereco.cidade ||
      !endereco.uf ||
      !endereco.cep
    ) {
      return {
        isValid: false,
        message: "Todos os campos do endereço são obrigatórios",
      };
    }

    if (endereco.uf.length !== 2) {
      return { isValid: false, message: "UF deve ter 2 caracteres" };
    }

    if (endereco.cep.replace(/\D/g, "").length !== 8) {
      return { isValid: false, message: "CEP inválido" };
    }

    return { isValid: true, message: "" };
  }

  // Validar CNPJ (básico)
  private isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    return cleanCNPJ.length === 14;
  }

  // Gerar UUID simples para simulação
  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}

export default new AuthService();
