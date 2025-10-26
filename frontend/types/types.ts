// Tipos globais da aplicação

export interface Endereco {
  id?: string; // uuid (opcional para update)
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Conta {
  id: string; // uuid
  email: string;
  password: string;
  tipo: "ONG" | "ADOTANTE"; // varchar(8)
  data_cadastro: Date;
}

// Interfaces para autenticação
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
  access?: string;
  refresh?: string;
}

export interface RegisterAdotanteRequest {
  conta: {
    email: string;
    password: string;
  };
  nome: string;
  idade: number;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
}

export interface RegisterONGRequest {
  conta: {
    email: string;
    password: string;
  };
  nome_fantasia: string;
  cnpj: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  tipo: "ONG" | "ADOTANTE";
  data_cadastro: Date;
  nome?: string; // Adotante
  nome_fantasia?: string; // ONG
  cnpj?: string; // ONG
  descricao?: string; // ONG
  idade?: number; // Adotante
  telefone: string;
  endereco: Endereco;
  vetor_caracteristicas?: number[]; // Adotante
  // imagem?: any; // ONG (enviado via multipart)
}

export interface Adotante {
  id: string; // uuid
  conta_id: string; // FK -> Conta
  nome: string;
  idade: number;
  telefone: string; // varchar(30)
  vetor_caracteristicas: number[]; // integer[]
  endereco_id: string; // FK -> Endereco
}

export interface ONG {
  id: string; // uuid
  conta_id: string; // FK -> Conta
  nome_fantasia: string;
  cnpj: string; // char(18)
  telefone: string; // varchar(30)
  endereco_id: string; // FK -> Endereco
}

export interface Pet {
  id: number; // integer
  ONG_id: string; // FK -> ONG
  adotante_id?: string | null; // FK -> Adotante (pode ser null)
  nome: string;
  idade: number;
  descricao: string;
  status: string; // varchar(15)
  vetor_caracteristicas: number[];
  // Campos adicionais para a interface
  foto?: any; // ImageSourcePropType
  raca?: string;
  peso?: string;
  sexo?: "Macho" | "Fêmea";
  vacinado?: boolean;
  castrado?: boolean;
  ong_nome?: string;
  ong_telefone?: string;
  ong_endereco?: string;
  ong_foto?: any; // ImageSourcePropType
}

export interface AdotanteQuestionario {
  tipo_imovel: string;
  localizacao: string;
  possui_area_externa: string;
  imovel_telado: string;
  quantidade_moradores: string;
  ha_criancas: string;
  ha_idosos: string;
  presenca_outros_animais: string;
  experiencia_animais: string;
  tempo_diario_disponivel: string;
  tempo_fora_casa: string;
  aceita_necessidades_especiais: string;
}

export interface Nota {
  id: number; // integer
  nota: number; // real
  comentario: string;
  data_avaliacao: Date;
  adotante_id: string; // FK -> Adotante
  ong_id: string; // FK -> ONG
}
