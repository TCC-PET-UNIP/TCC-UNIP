// Configurações da API
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Gera a BASE_URL dinamicamente para funcionar no Expo Go (dispositivo)
const computeBaseUrl = () => {
  // Web usa localhost
  if (Platform.OS === "web") return "http://localhost:8000/server";

  // Tenta extrair o host do debuggerHost do Expo (ex: "192.168.1.10:19000")
  try {
    // @ts-ignore - manifest types variam entre SDKs
    const manifest: any = Constants.manifest || Constants.expoConfig;
    const debuggerHost = manifest?.debuggerHost;
    if (debuggerHost && typeof debuggerHost === "string") {
      const host = debuggerHost.split(":")[0];
      return `http://${host}:8000/server`;
    }
  } catch (e) {
    // ignore
  }

  // Fallbacks comuns:
  // - Emulador Android usa 10.0.2.2 para localhost da máquina
  // - Se nada for detectado, usar 10.0.2.2 (funciona em muitos setups de dev)
  return "http://10.0.2.2:8000/server";
};

const API_CONFIG = {
  BASE_URL: computeBaseUrl(),
  ENDPOINTS: {
    REGISTER_ONG: "/register_ong",
    REGISTER_ADOPTER: "/register_adopter",
    LOGIN: "/login",
    HEALTH: "/health",
  },
};

// Criar instância axios com baseURL
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar Authorization quando omitAuth não for true
axiosInstance.interceptors.request.use(
  async (config: any) => {
    const omitAuth = Boolean(config?.omitAuth);

    if (!omitAuth) {
      try {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          config.headers = {
            ...((config.headers as any) || {}),
            Authorization: `Bearer ${token}`,
          } as any;
        }
      } catch (e) {
        // se não for possível ler o token, apenas não adiciona Authorization
      }
    }

    // garantir content-type
    config.headers = {
      ...((config.headers as any) || {}),
      "Content-Type": "application/json",
    } as any;

    return config;
  },
  (error) => Promise.reject(error)
);

// Função helper para fazer requisições utilizando axios
export const apiRequest = async (
  endpoint: string,
  options: RequestInit & { omitAuth?: boolean } = {}
): Promise<any> => {
  const method = (options.method || "GET") as any;

  // Se houver body (string JSON), transformar em objeto para axios
  let data: any = undefined;
  if (options.body) {
    try {
      data =
        typeof options.body === "string"
          ? JSON.parse(options.body)
          : options.body;
    } catch {
      data = options.body;
    }
  }

  const axiosConfig: any = {
    url: endpoint,
    method,
    data,
    headers: options.headers || {},
    // passar omitAuth para o interceptor
    omitAuth: (options as any).omitAuth,
    // timeout opcional pode ser adicionado aqui
  };

  try {
    const response = await axiosInstance.request(axiosConfig);
    return response.data;
  } catch (error: any) {
    // Tentar extrair mensagem de erro do axios
    const resp = error?.response;
    if (resp && resp.data) {
      const errorData = resp.data;
      const message =
        errorData.error || errorData.message || JSON.stringify(errorData);
      throw new Error(message);
    }
    console.error("API Request Error:", error);
    throw error;
  }
};

export default API_CONFIG;
