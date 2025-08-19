import { Ong } from "../types/types";

export const mockOngs: Ong[] = [
  {
    id: 1,
    name: "ONG Patinhas Felizes",
    email: "contato@patinhasfelizes.org",
    password: "ong123",
    city: "Belo Horizonte",
    state: "MG",
    role: "ONG",
    cnpj: "12.345.678/0001-99",
    description: "ONG dedicada ao resgate e adoção de animais.",
    avatar: "https://randomuser.me/api/portraits/lego/3.jpg",
  },
  {
    id: 2,
    name: "ONG Amigos dos Animais",
    email: "amigos@onganimais.org",
    password: "amigos456",
    city: "Curitiba",
    state: "PR",
    role: "ONG",
    cnpj: "98.765.432/0001-11",
    description: "Acolhimento e adoção responsável de pets.",
    avatar: "https://randomuser.me/api/portraits/lego/4.jpg",
  },
];
