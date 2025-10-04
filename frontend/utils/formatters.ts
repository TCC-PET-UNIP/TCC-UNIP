/**
 * Formatadores para dados do projeto PetHelper
 */

/**
 * Formata CNPJ para o padrão brasileiro XX.XXX.XXX/XXXX-XX
 * @param text - String com números do CNPJ
 * @returns String formatada
 */
export const formatCNPJ = (text: string): string => {
  const cleaned = text.replace(/\D/g, "");
  const formatted = cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
  return formatted;
};

/**
 * Formata CEP para o padrão brasileiro XXXXX-XXX
 * @param text - String com números do CEP
 * @returns String formatada
 */
export const formatCEP = (text: string): string => {
  const cleaned = text.replace(/\D/g, "");
  const formatted = cleaned.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  return formatted;
};

/**
 * Formata telefone brasileiro para o padrão (XX) XXXXX-XXXX
 * @param text - String com números do telefone
 * @returns String formatada
 */
export const formatPhone = (text: string): string => {
  const cleaned = text.replace(/\D/g, "");

  // Para telefones com 11 dígitos (celular com 9)
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  // Para telefones com 10 dígitos (fixo)
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  // Formatação parcial durante a digitação
  if (cleaned.length >= 7) {
    return cleaned.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, "($1) $2-$3");
  } else if (cleaned.length >= 3) {
    return cleaned.replace(/^(\d{2})(\d+)$/, "($1) $2");
  } else if (cleaned.length >= 1) {
    return cleaned.replace(/^(\d+)$/, "($1");
  }

  return cleaned;
};

/**
 * Remove formatação de strings, mantendo apenas números
 * @param text - String formatada
 * @returns String apenas com números
 */
export const removeFormatting = (text: string): string => {
  return text.replace(/\D/g, "");
};

/**
 * Formata nome próprio (primeira letra maiúscula)
 * @param text - String com o nome
 * @returns String formatada
 */
export const formatProperName = (text: string): string => {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Formata email para lowercase
 * @param text - String com email
 * @returns String formatada
 */
export const formatEmail = (text: string): string => {
  return text.trim().toLowerCase();
};
