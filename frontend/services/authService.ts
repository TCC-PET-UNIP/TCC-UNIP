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
} from "../utils/validators";
import axios from "axios";
import API_CONFIG, {
  saveAuthData,
  clearAuthData,
  getAuthData,
} from "./apiConfig";

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
      const resp = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        { email: credentials.email, senha: credentials.senha },
        { headers: { "Content-Type": "application/json" } }
      );

      const response = resp.data;

      // Processar resposta do backend
      const { user, access, refresh } = response;

      // Determinar tipo de usuário e construir perfil
      const userProfile: UserProfile = this.buildUserProfile(user);

      // Salvar dados no AsyncStorage (centralizado)
      await saveAuthData(access, refresh, userProfile);

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
      const resp = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER_ADOPTER}`,
        requestData,
        { headers: { "Content-Type": "application/json" } }
      );
      const response = resp.data;

      // Processar resposta
      const { user, access, refresh } = response;
      const userProfile: UserProfile = this.buildUserProfile({
        adotante: user,
        ong: null,
      });

      // Salvar dados (centralizado)
      await saveAuthData(access, refresh, userProfile);

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
      const resp = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER_ONG}`,
        requestData,
        { headers: { "Content-Type": "application/json" } }
      );
      const response = resp.data;

      // Processar resposta
      const { user, access, refresh } = response;
      const userProfile: UserProfile = this.buildUserProfile({
        ong: user,
        adotante: null,
      });

      // Salvar dados (centralizado)
      await saveAuthData(access, refresh, userProfile);

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
    await clearAuthData();
  }

  // Verificar se usuário está logado
  async isLoggedIn(): Promise<boolean> {
    try {
      const { access } = await getAuthData();
      return !!access;
    } catch {
      return false;
    }
  }

  // Obter perfil do usuário
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const { userProfile } = await getAuthData();
      return userProfile;
    } catch {
      return null;
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(updatedProfile: UserProfile): Promise<void> {
    try {
      // Envia a atualização para o backend conforme o tipo de usuário
      const { access, refresh } = await getAuthData();
      const token = access;

      if (!token) throw new Error("Usuário não autenticado");

      if (updatedProfile.tipo === "ONG") {
        // Backend espera multipart/form-data para atualizar ONG (pode incluir imagem)
        const form = new FormData();
        // id da ong (uuid)
        form.append("id", updatedProfile.id);

        if ((updatedProfile as any).nome_fantasia)
          form.append("nome_fantasia", (updatedProfile as any).nome_fantasia);
        if ((updatedProfile as any).cnpj)
          form.append("cnpj", (updatedProfile as any).cnpj);
        if ((updatedProfile as any).telefone)
          form.append("telefone", (updatedProfile as any).telefone);
        if ((updatedProfile as any).descricao)
          form.append("descricao", (updatedProfile as any).descricao);

        // Endereço — backend usa keys como endereco.logradouro etc.
        if (updatedProfile.endereco) {
          const e: any = updatedProfile.endereco;
          if (e.logradouro) form.append("endereco.logradouro", e.logradouro);
          if (e.numero) form.append("endereco.numero", e.numero);
          if (e.bairro) form.append("endereco.bairro", e.bairro);
          if (e.cidade) form.append("endereco.cidade", e.cidade);
          if (e.uf) form.append("endereco.uf", e.uf);
          if (e.cep) form.append("endereco.cep", e.cep);
        }

        // Possível imagem: aceitar vários nomes de campo usados na UI
        const possibleImage =
          (updatedProfile as any).profileImage ||
          (updatedProfile as any).foto_file ||
          (updatedProfile as any).imagem ||
          (updatedProfile as any).ong_foto;
        if (possibleImage && (possibleImage as any).uri) {
          const img: any = possibleImage;
          const uri = img.uri;
          const name = img.name || `photo_${Date.now()}.jpg`;
          const type = img.type || "image/jpeg";
          // campo 'imagem' conforme documentação de register/update
          form.append("imagem", { uri, name, type } as any);
        }

        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_ONG}`;
        await axios.patch(url, form as any, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // ADOTANTE: enviar JSON contendo id e campos editados
        const payload: any = { id: updatedProfile.id };
        if ((updatedProfile as any).nome)
          payload.nome = (updatedProfile as any).nome;
        if ((updatedProfile as any).idade !== undefined)
          payload.idade = (updatedProfile as any).idade;
        if ((updatedProfile as any).telefone)
          payload.telefone = (updatedProfile as any).telefone;
        if ((updatedProfile as any).email)
          payload.email = (updatedProfile as any).email;
        if (updatedProfile.endereco) payload.endereco = updatedProfile.endereco;

        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_ADOPTER}`;
        await axios.patch(url, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      // Se a requisição ocorreu sem erros, atualiza o perfil localmente
      await saveAuthData(access || "", refresh || "", updatedProfile);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil no backend:", error);
      // repassa mensagem do backend quando disponível
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao atualizar perfil";
      throw new Error(msg);
    }
  }

  // Verificar saúde do backend
  async healthCheck(): Promise<boolean> {
    try {
      const resp = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`,
        { headers: { "Content-Type": "application/json" } }
      );
      return resp.data?.status === "ok";
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
