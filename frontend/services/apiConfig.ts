// Configurações da API
import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Defina o IP da máquina que roda o backend aqui:
const LOCAL_IP = "10.23.245.70"; // ajuste conforme sua rede

const computeBaseUrl = () => {
  // Web e dispositivos usam o IP fixo
  return `http://${LOCAL_IP}:8000/server`;
};

const API_CONFIG = {
  BASE_URL: computeBaseUrl(),
  ENDPOINTS: {
    REGISTER_ONG: "/register_ong",
    REGISTER_ADOPTER: "/register_adopter",
    LOGIN: "/login", 
    HEALTH: "/health",
    PETS: "/pets",
    REGISTER_PET: "/register_pet",
    UPDATE_PET: "/update_pet_data",
    GET_COMPATIBLE_PETS: "/get_compatible_pets",
    UPDATE_ONG: "/update_ong_data",
    UPDATE_ADOPTER: "/update_adopter_data",
  },
};

// Instância axios com baseURL
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
    omitAuth: (options as any).omitAuth,
  };

  console.log("URL da requisição:", API_CONFIG.BASE_URL + endpoint);

  try {
    const response = await axiosInstance.request(axiosConfig);
    return response.data;
  } catch (error: any) {
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

// Storage keys and helpers to centralize token/profile persistence
export const STORAGE_KEYS = {
  ACCESS: "userToken",
  REFRESH: "refreshToken",
  PROFILE: "userProfile",
};

export const saveAuthData = async (
  access: string,
  refresh: string,
  userProfile?: any
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS, access);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH, refresh);
    if (userProfile) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PROFILE,
        JSON.stringify(userProfile)
      );
    }
  } catch (e) {
    console.error("saveAuthData error:", e);
    throw e;
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS,
      STORAGE_KEYS.REFRESH,
      STORAGE_KEYS.PROFILE,
    ]);
  } catch (e) {
    console.error("clearAuthData error:", e);
    throw e;
  }
};

export const getAuthData = async (): Promise<{
  access: string | null;
  refresh: string | null;
  userProfile: any | null;
}> => {
  try {
    const access = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS);
    const refresh = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH);
    const profileRaw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    return {
      access,
      refresh,
      userProfile: profileRaw ? JSON.parse(profileRaw) : null,
    };
  } catch (e) {
    console.error("getAuthData error:", e);
    return { access: null, refresh: null, userProfile: null };
  }
};
