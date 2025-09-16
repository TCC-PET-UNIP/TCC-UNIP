import { Pet } from '../types/types';

// Mapear características numéricas para textos legíveis
const caracteristicasMap: { [key: number]: string } = {
  1: 'Calmo',
  2: 'Carinhoso',
  3: 'Obediente',
  4: 'Brincalhão',
  5: 'Protetor',
  6: 'Independente',
  7: 'Sociável',
  8: 'Energético',
  9: 'Dócil',
  10: 'Inteligente'
};

export const mockPets: Pet[] = [
  {
    id: 1,
    ONG_id: '550e8400-e29b-41d4-a716-446655440001',
    nome: 'Bob',
    idade: 3,
    descricao: 'Bob é um cachorro muito carinhoso e obediente. Adora brincar no quintal e é muito apegado às pessoas. Ideal para famílias com crianças. Já foi vacinado e castrado.',
    status: 'disponivel',
    vetor_caracteristicas: [1, 2, 3], // Calmo, Carinhoso, Obediente
    foto: require('@/assets/images/Dog_Thor1.jpg'),
    raca: 'Vira-lata',
    peso: '15kg',
    sexo: 'Macho',
    vacinado: true,
    castrado: true,
    ong_nome: 'ONG Amor Animal',
    ong_telefone: '(11) 99999-1111',
    ong_endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    ong_foto: require('@/assets/images/Dog_Login.png')
  },
  {
    id: 2,
    ONG_id: '550e8400-e29b-41d4-a716-446655440002',
    nome: 'Thor',
    idade: 2,
    descricao: 'Thor é um cão jovem e muito brincalhão. Adora correr e brincar com outros animais. É protetor da casa mas muito sociável com visitantes. Perfeito para quem tem espaço.',
    status: 'disponivel',
    vetor_caracteristicas: [4, 5, 7], // Brincalhão, Protetor, Sociável
    foto: require('@/assets/images/Dog_Thor2.jpg'),
    raca: 'Pastor Alemão Mix',
    peso: '25kg',
    sexo: 'Macho',
    vacinado: true,
    castrado: false,
    ong_nome: 'Patinhas Felizes',
    ong_telefone: '(11) 99999-2222',
    ong_endereco: 'Av. Paulista, 456 - Bela Vista, São Paulo - SP',
    ong_foto: require('@/assets/images/Cat.jpg')
  },
  {
    id: 3,
    ONG_id: '550e8400-e29b-41d4-a716-446655440003',
    nome: 'Luna',
    idade: 1,
    descricao: 'Luna é uma gatinha muito dócil e carinhosa. Adora colo e é muito tranquila. Ideal para apartamentos e pessoas que buscam um companheiro calmo e afetuoso.',
    status: 'disponivel',
    vetor_caracteristicas: [1, 2, 9], // Calmo, Carinhoso, Dócil
    foto: require('@/assets/images/Cat.jpg'),
    raca: 'Siamês Mix',
    peso: '3kg',
    sexo: 'Fêmea',
    vacinado: true,
    castrado: true,
    ong_nome: 'Lar dos Felinos',
    ong_telefone: '(11) 99999-3333',
    ong_endereco: 'Rua Augusta, 789 - Consolação, São Paulo - SP',
    ong_foto: require('@/assets/images/Dog_Pic.jpg')
  },
  {
    id: 4,
    ONG_id: '550e8400-e29b-41d4-a716-446655440001',
    nome: 'Mila',
    idade: 4,
    descricao: 'Mila é uma cadela muito inteligente e energética. Gosta de caminhadas longas e aprender truques novos. É independente mas muito leal ao dono.',
    status: 'disponivel',
    vetor_caracteristicas: [8, 10, 6], // Energético, Inteligente, Independente
    foto: require('@/assets/images/Dog_Login.png'),
    raca: 'Poodle',
    peso: '8kg',
    sexo: 'Fêmea',
    vacinado: true,
    castrado: true,
    ong_nome: 'ONG Amor Animal',
    ong_telefone: '(11) 99999-1111',
    ong_endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    ong_foto: require('@/assets/images/Dog_Login.png')
  },
  {
    id: 5,
    ONG_id: '550e8400-e29b-41d4-a716-446655440002',
    nome: 'Rex',
    idade: 5,
    descricao: 'Rex é um cão maduro e muito obediente. Ideal para quem busca um companheiro tranquilo e bem treinado. É protetor mas nunca agressivo.',
    status: 'disponivel',
    vetor_caracteristicas: [1, 3, 5], // Calmo, Obediente, Protetor
    foto: require('@/assets/images/Dog_Pic.jpg'),
    raca: 'Labrador Mix',
    peso: '30kg',
    sexo: 'Macho',
    vacinado: true,
    castrado: true,
    ong_nome: 'Patinhas Felizes',
    ong_telefone: '(11) 99999-2222',
    ong_endereco: 'Av. Paulista, 456 - Bela Vista, São Paulo - SP',
    ong_foto: require('@/assets/images/Cat.jpg')
  }
];

export const getCaracteristicasTexto = (vetor: number[]): string[] => {
  return vetor.map(num => caracteristicasMap[num] || 'Característica').filter(Boolean);
};

export const getPetById = (id: number): Pet | undefined => {
  return mockPets.find(pet => pet.id === id);
};