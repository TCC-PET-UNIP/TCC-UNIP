// Tipos globais da aplicação

export type UserRole = "Adotante" | "ONG";

interface BaseUser {
    id: number;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    city: string;
    state: string;
}

export interface Adotante extends BaseUser {
    role: "Adotante";
    cpf: string;
    age: number;
}

export interface Ong extends BaseUser {
    role: "ONG";
    cnpj: string;
    description: string;
}

export type User = Adotante | Ong;
