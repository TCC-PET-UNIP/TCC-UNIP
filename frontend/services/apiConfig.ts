// Configurações da API
const API_CONFIG = {
  BASE_URL: "http://localhost:8000/server",
  ENDPOINTS: {
    REGISTER_ONG: "/register_ong",
    REGISTER_ADOPTER: "/register_adopter",
    LOGIN: "/login",
    HEALTH: "/health",
  },
};

// Função helper para fazer requisições
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Adicionar token de autenticação se existir
  const token = await getAuthToken();
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Se a resposta não for ok, lançar erro
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Helper para pegar o token (será implementado no authService)
const getAuthToken = async (): Promise<string | null> => {
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    return await AsyncStorage.getItem("userToken");
  } catch {
    return null;
  }
};

export default API_CONFIG;
