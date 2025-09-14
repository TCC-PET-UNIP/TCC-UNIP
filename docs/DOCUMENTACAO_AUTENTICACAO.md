# Documentação - Sistema de Login e Cadastro

## PetHelper - TCC UNIP

### Visão Geral

Este documento descreve a implementação completa do sistema de autenticação (login e cadastro) para o aplicativo PetHelper, desenvolvido como TCC da UNIP. O sistema foi implementado apenas no frontend (React Native), com simulação das funcionalidades do backend.

---

## 🏗️ Arquitetura da Solução

### Estrutura de Arquivos Criados/Modificados

```
frontend/
├── services/
│   └── authService.ts          # Serviço central de autenticação
├── types/
│   └── types.ts               # Interfaces TypeScript atualizadas
├── Screens/
│   ├── Login.tsx              # Tela de login atualizada
│   ├── Register.tsx           # Tela de cadastro completa
│   └── HomeAuth.tsx           # Tela home para usuários autenticados
```

---

## 📋 Tipos e Interfaces

### Interfaces Principais

#### `Conta`

```typescript
interface Conta {
  id: string; // UUID
  email: string; // Email único do usuário
  senha: string; // Senha (hash no backend real)
  tipo: "ONG" | "ADOTANTE"; // Tipo de conta
  data_cadastro: Date; // Data de criação da conta
}
```

#### `UserProfile`

```typescript
interface UserProfile {
  id: string;
  email: string;
  tipo: "ONG" | "ADOTANTE";
  data_cadastro: Date;
  nome?: string; // Para adotantes
  nome_fantasia?: string; // Para ONGs
  cnpj?: string; // Para ONGs
  idade?: number; // Para adotantes
  telefone: string;
  endereco: Endereco;
}
```

#### Interfaces de Requisição

- **`LoginRequest`**: Email e senha para autenticação
- **`RegisterAdotanteRequest`**: Dados completos para cadastro de adotante
- **`RegisterONGRequest`**: Dados completos para cadastro de ONG
- **`LoginResponse`**: Resposta padronizada com sucesso, mensagem, usuário e token

---

## 🔐 AuthService - Serviço de Autenticação

### Localização

`frontend/services/authService.ts`

### Funcionalidades Implementadas

#### 1. **Login (`login`)**

```typescript
async login(credentials: LoginRequest): Promise<LoginResponse>
```

**Fluxo:**

1. Validação de entrada (email e senha obrigatórios)
2. Validação de formato de email (regex)
3. Validação de tamanho mínimo da senha (6 caracteres)
4. Simulação de delay de rede (1 segundo)
5. Criação de perfil de usuário simulado
6. Armazenamento no AsyncStorage (token e perfil)
7. Retorno de resposta padronizada

**Validações:**

- ✅ Email obrigatório
- ✅ Senha obrigatória
- ✅ Formato de email válido
- ✅ Senha mínima de 6 caracteres

#### 2. **Cadastro de Adotante (`registerAdotante`)**

```typescript
async registerAdotante(data: RegisterAdotanteRequest): Promise<LoginResponse>
```

**Campos Obrigatórios:**

- Email (validado)
- Senha e confirmação de senha
- Nome completo
- Idade (numérico)
- Telefone (formatado automaticamente)
- Endereço completo (logradouro, número, bairro, cidade, UF, CEP)

**Validações Específicas:**

- ✅ Senhas coincidem
- ✅ Telefone mínimo de 10 dígitos
- ✅ CEP com 8 dígitos
- ✅ UF com 2 caracteres
- ✅ Todos os campos de endereço preenchidos

#### 3. **Cadastro de ONG (`registerONG`)**

```typescript
async registerONG(data: RegisterONGRequest): Promise<LoginResponse>
```

**Campos Específicos da ONG:**

- Nome fantasia
- CNPJ (validado e formatado)
- Mesmas validações de endereço e contato

**Validações Adicionais:**

- ✅ CNPJ com 14 dígitos (básica)
- ✅ Formatação automática do CNPJ

#### 4. **Utilitários**

- `logout()`: Limpa dados do AsyncStorage
- `isLoggedIn()`: Verifica se existe token válido
- `getUserProfile()`: Recupera perfil armazenado
- Validações comuns centralizadas
- Formatadores de texto (CNPJ, CEP, telefone)
- Gerador de UUID para simulação

---

## 📱 Telas (Screens)

### 1. Login (`Screens/Login.tsx`)

**Funcionalidades:**

- ✅ Verificação automática de sessão ativa
- ✅ Validação em tempo real dos campos
- ✅ Toggle para mostrar/ocultar senha
- ✅ Loading state durante autenticação
- ✅ Integração com AuthService
- ✅ Navegação automática para home após login
- ✅ Tratamento de erros com alertas

**Estados Gerenciados:**

- Email, senha, visibilidade da senha, loading

### 2. Registro (`Screens/Register.tsx`)

**Funcionalidades:**

- ✅ Seleção entre tipo de conta (Adotante/ONG)
- ✅ Formulário dinâmico baseado no tipo selecionado
- ✅ Formatação automática de campos (CNPJ, CEP, telefone)
- ✅ Validação em tempo real
- ✅ ScrollView para campos extensos
- ✅ Confirmação de senha com toggle de visibilidade
- ✅ Endereço completo obrigatório
- ✅ Loading state e feedback visual
- ✅ Navegação automática após cadastro

**Campos por Tipo:**

**Adotante:**

- Nome completo, idade, email, senha, telefone, endereço

**ONG:**

- Nome fantasia, CNPJ, email, senha, telefone, endereço

**Formatação Automática:**

- CNPJ: `12.345.678/0001-90`
- CEP: `12345-678`
- Telefone: `(11) 99999-9999`

### 3. Home Autenticada (`Screens/HomeAuth.tsx`)

**Funcionalidades:**

- ✅ Verificação de autenticação na inicialização
- ✅ Carregamento do perfil do usuário
- ✅ Exibição de informações personalizadas por tipo
- ✅ Botões de ação específicos por tipo de usuário
- ✅ Logout com confirmação
- ✅ Tratamento de estados de loading e erro

---

## 💾 Armazenamento Local

### AsyncStorage

**Chaves utilizadas:**

- `userToken`: Token de autenticação (simulado)
- `userProfile`: Perfil completo do usuário (JSON)

**Operações:**

- **Salvamento**: Ao fazer login/cadastro
- **Leitura**: Na verificação de sessão e carregamento de perfil
- **Limpeza**: No logout

---

## ✅ Validações Implementadas

### Validações de Email

- Formato válido (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Campo obrigatório

### Validações de Senha

- Mínimo 6 caracteres
- Confirmação de senha deve coincidir
- Campo obrigatório

### Validações de Dados Pessoais

- **Telefone**: Mínimo 10 dígitos
- **Idade**: Valor numérico válido
- **CNPJ**: 14 dígitos (validação básica)

### Validações de Endereço

- Todos os campos obrigatórios
- **CEP**: Exatamente 8 dígitos
- **UF**: Exatamente 2 caracteres (maiúsculas)

---

## 🔄 Fluxo de Navegação

### Fluxo Principal

```
1. App inicia → Verifica sessão
2. Se logado → Home
3. Se não logado → Login
4. Login → Home (após autenticação)
5. Register → Home (após cadastro)
6. Home → Logout → Login
```

### Estados de Loading

- Login: "ENTRANDO..."
- Cadastro: "CADASTRANDO..."
- Home: "Carregando..."

---

## 🛡️ Segurança e Boas Práticas

### Implementadas

- ✅ Validação de entrada em todas as telas
- ✅ Sanitização de dados (trim, toLowerCase para email)
- ✅ Não exposição de senhas em logs
- ✅ Verificação de sessão em páginas protegidas
- ✅ Logout seguro com limpeza de dados
- ✅ Tratamento de erros sem exposição de informações sensíveis

### Para Implementação Futura (Backend Real)

- Hash de senhas (bcrypt)
- JWT tokens com expiração
- Rate limiting para login
- Validação de CNPJ completa
- Criptografia de dados sensíveis
- Logs de auditoria

---

## 🎨 Interface e UX

### Design System

- **Cores principais**:
  - Marrom: `#B87B56` (primária)
  - Azul claro: `#8DC6CE` (botões)
  - Vermelho: `#ad3434` (títulos/erro)
  - Creme: `#F8F3EC` (fundos)

### Elementos de UX

- ✅ Loading states visuais
- ✅ Feedback imediato de erros
- ✅ Formatação automática de campos
- ✅ Navegação intuitiva
- ✅ Confirmação de ações críticas (logout)
- ✅ Layout responsivo e scroll quando necessário

---

## 🧪 Dados de Teste

### Para Login (simulado)

- **Adotante**: qualquer email sem "ong" + senha de 6+ caracteres
- **ONG**: email contendo "ong" + senha de 6+ caracteres

### Exemplos

```
Email: joao@teste.com / Senha: 123456 → Adotante
Email: ong@exemplo.com / Senha: 123456 → ONG
```

---

## 🔄 Próximos Passos

### Integração com Backend Real

1. Substituir chamadas simuladas por HTTP requests
2. Implementar interceptors para tratamento de tokens
3. Adicionar refresh token
4. Implementar validação de email por código
5. Adicionar recuperação de senha

### Melhorias de UX

1. Validação em tempo real nos campos
2. Autocomplete de endereço via CEP
3. Captura de foto de perfil
4. Modo offline com sincronização

### Segurança

1. Implementar biometria
2. Adicionar 2FA opcional
3. Detectar tentativas de login suspeitas
4. Criptografia local de dados sensíveis

---

## 📝 Considerações Técnicas

### Performance

- Uso eficiente do AsyncStorage
- Validações otimizadas
- Estados de loading para feedback

### Manutenibilidade

- Código modular e reutilizável
- Tipagem TypeScript completa
- Separação clara de responsabilidades
- Documentação inline no código

### Escalabilidade

- Service pattern para fácil substituição do backend
- Interfaces bem definidas
- Componentes reutilizáveis

---

## 🐛 Problemas Conhecidos e Limitações

### Limitações Atuais

1. **Simulação apenas**: Dados não persistem entre sessões do app
2. **Validação de CNPJ**: Apenas verificação de formato
3. **Sem validação de email real**: Não verifica se email existe
4. **Dados estáticos**: Perfis gerados aleatoriamente

### Workarounds Implementados

- AsyncStorage para persistência local
- Validações frontend robustas
- Feedback visual adequado
- Tratamento de erros gracioso

---

## 📚 Tecnologias Utilizadas

- **React Native**: Framework principal
- **TypeScript**: Tipagem estática
- **Expo Router**: Navegação
- **AsyncStorage**: Armazenamento local
- **Expo Vector Icons**: Ícones
- **NativeWind**: Estilização

---

**Autor**: Sistema de Autenticação PetHelper  
**Data**: Setembro 2025  
**Versão**: 1.0  
**TCC UNIP**
