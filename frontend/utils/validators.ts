/**
 * Validadores para dados do projeto PetHelper
 */

/**
 * Valida formato de email
 * @param email - String com email
 * @returns boolean
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida senha (mínimo 6 caracteres)
 * @param password - String com senha
 * @returns boolean
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Valida confirmação de senha
 * @param password - Senha original
 * @param confirmPassword - Confirmação da senha
 * @returns boolean
 */
export const isPasswordMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};

/**
 * Valida CNPJ brasileiro
 * @param cnpj - String com CNPJ (pode estar formatado)
 * @returns boolean
 */
export const isValidCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, "");

  if (cleaned.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  // Validação dos dígitos verificadores
  let soma = 0;
  let pos = 5;

  // Primeiro dígito verificador
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cleaned.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(cleaned.charAt(12))) return false;

  // Segundo dígito verificador
  soma = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cleaned.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(cleaned.charAt(13));
};

/**
 * Valida CEP brasileiro
 * @param cep - String com CEP (pode estar formatado)
 * @returns boolean
 */
export const isValidCEP = (cep: string): boolean => {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.length === 8 && /^\d{8}$/.test(cleaned);
};

/**
 * Valida telefone brasileiro
 * @param phone - String com telefone (pode estar formatado)
 * @returns boolean
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  // Aceita telefones com 10 dígitos (fixo) ou 11 dígitos (celular)
  return cleaned.length === 10 || cleaned.length === 11;
};

/**
 * Valida idade (entre 16 e 120 anos)
 * @param age - Número ou string com idade
 * @returns boolean
 */
export const isValidAge = (age: string | number): boolean => {
  const ageNum = typeof age === "string" ? parseInt(age) : age;
  return !isNaN(ageNum) && ageNum >= 16 && ageNum <= 120;
};

/**
 * Valida se campo não está vazio
 * @param value - String para validar
 * @returns boolean
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida nome (mínimo 2 caracteres, apenas letras e espaços)
 * @param name - String com nome
 * @returns boolean
 */
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,}$/;
  return nameRegex.test(name.trim());
};
