# Documentação - Estrutura de Pastas Frontend

## PetHelper - TCC UNIP

### 📂 Estrutura Geral do Projeto Frontend

```
frontend/
├── 📁 app/                          # Expo Router - Rotas da aplicação
│   ├── 📄 _layout.tsx              # Layout principal das rotas
│   ├── 📄 home.tsx                 # Rota principal (/home)
│   ├── 📄 index.tsx                # Rota inicial (/)
│   ├── 📄 login.tsx                # Rota de login (/login)
│   ├── 📄 register.tsx             # Rota de cadastro (/register)
│   └── 📁 pet-details/            # Rotas dinâmicas para detalhes
│       └── 📄 [id].tsx            # Rota dinâmica (/pet-details/[id])
│
├── 📁 assets/                      # Recursos estáticos
│   ├── 📁 fonts/                  # Fontes customizadas
│   │   └── 📄 SpaceMono-Regular.ttf
│   └── 📁 images/                 # Imagens da aplicação
│       ├── 📄 adaptive-icon.png
│       ├── 📄 Cat.jpg            # Imagem de gato
│       ├── 📄 Dog_Login.png      # Imagem do login
│       ├── 📄 Dog_Pic.jpg        # Imagem de cachorro
│       ├── 📄 Dog_Thor1.jpg      # Imagem Thor 1
│       ├── 📄 Dog_Thor2.jpg      # Imagem Thor 2
│       ├── 📄 Dog_Thor3.jpg      # Imagem Thor 3
│       ├── 📄 favicon.png
│       ├── 📄 icon.png
│       ├── 📄 partial-react-logo.png
│       ├── 📄 react-logo.png
│       ├── 📄 react-logo@2x.png
│       ├── 📄 react-logo@3x.png
│       └── 📄 splash-icon.png
│
├── 📁 components/                  # Componentes reutilizáveis
│   └── 📄 BottomNavigation.tsx    # Componente de navegação inferior
│
├── 📁 mockData/                    # Dados de simulação/teste
│   ├── 📄 mockAdotantes.ts        # Dados mockados de adotantes
│   ├── 📄 mockOngs.ts             # Dados mockados de ONGs
│   ├── 📄 mockPets.ts             # Dados mockados de pets
│   └── 📄 mockUsers.ts            # Dados mockados de usuários
│
├── 📁 Screens/                     # Telas da aplicação
│   ├── 📄 Home.tsx                # Tela principal (swipe e lista)
│   ├── 📄 HomeAuth.tsx            # Tela home para usuários autenticados
│   ├── 📄 Login.tsx               # Tela de login
│   ├── 📄 PetDetailsScreen.tsx    # Tela de detalhes do pet
│   └── 📄 Register.tsx            # Tela de cadastro
│
├── 📁 services/                    # Serviços e API
│   └── 📄 authService.ts          # Serviço de autenticação
│
├── 📁 styles/                      # Estilos globais
│   └── 📄 global.css              # CSS global do projeto
│
├── 📁 types/                       # Definições TypeScript
│   └── 📄 types.ts                # Interfaces e tipos globais
│
├── 📄 app.json                     # Configuração do Expo
├── 📄 babel.config.js              # Configuração do Babel
├── 📄 expo-env.d.ts                # Tipos do Expo
├── 📄 metro.config.js              # Configuração do Metro
├── 📄 nativewind-env.d.ts          # Tipos do NativeWind
├── 📄 package.json                 # Dependências e scripts
├── 📄 README.md                    # Documentação do projeto
├── 📄 tailwind.config.js           # Configuração do Tailwind
└── 📄 tsconfig.json                # Configuração TypeScript
```

---

## 📝 Descrição Detalhada das Pastas

### 🗂️ **app/** - Sistema de Rotas (Expo Router)

Gerencia toda a navegação da aplicação usando o padrão file-based routing.

#### **Arquivos Principais:**

- **`_layout.tsx`**: Layout base que envolve todas as telas
- **`index.tsx`**: Tela inicial (/) - primeira tela carregada
- **`home.tsx`**: Tela principal (/home) com pets
- **`login.tsx`**: Tela de autenticação (/login)
- **`register.tsx`**: Tela de cadastro (/register)

#### **Subpastas:**

- **`pet-details/[id].tsx`**: Rota dinâmica para detalhes específicos do pet

### 🖼️ **assets/** - Recursos Estáticos

Contém todos os arquivos estáticos da aplicação.

#### **Subpastas:**

- **`fonts/`**: Fontes personalizadas do projeto
- **`images/`**: Todas as imagens utilizadas na UI
  - Imagens de pets para demonstração
  - Ícones e logos da aplicação
  - Imagens de splash e adaptativas

### 🧩 **components/** - Componentes Reutilizáveis

Componentes que podem ser usados em múltiplas telas.

#### **Componentes Atuais:**

- **`BottomNavigation.tsx`**: Barra de navegação inferior
  - Ícones diferentes por tipo de usuário
  - Navegação entre seções principais
  - Estado ativo baseado na rota atual

### 📊 **mockData/** - Dados de Simulação

Dados estáticos para desenvolvimento e testes.

#### **Arquivos:**

- **`mockPets.ts`**: Lista de pets com características completas
- **`mockAdotantes.ts`**: Dados de adotantes simulados
- **`mockOngs.ts`**: Dados de ONGs simuladas
- **`mockUsers.ts`**: Usuários para login de teste

### 📱 **Screens/** - Telas da Aplicação

Todas as telas principais da aplicação.

#### **Telas Implementadas:**

- **`Home.tsx`**: Tela principal com dois modos:
  - **Modo Swipe**: Cards deslizáveis estilo Tinder
  - **Modo Lista**: Layout de lista igual às imagens fornecidas
- **`HomeAuth.tsx`**: Tela de perfil do usuário autenticado
- **`Login.tsx`**: Tela de login com botão demo
- **`Register.tsx`**: Tela de cadastro para adotantes e ONGs
- **`PetDetailsScreen.tsx`**: Detalhes completos do pet

### ⚙️ **services/** - Serviços e Integrações

Lógica de negócio e integrações com APIs.

#### **Serviços:**

- **`authService.ts`**: Gerenciamento de autenticação
  - Login/logout
  - Cadastro de usuários
  - Gerenciamento de sessão
  - Validações

### 🎨 **styles/** - Estilos Globais

Estilos que se aplicam a toda a aplicação.

#### **Arquivos:**

- **`global.css`**: CSS global com classes do Tailwind

### 🔧 **types/** - Definições TypeScript

Interfaces e tipos utilizados em toda a aplicação.

#### **Tipos Principais:**

- **`Pet`**: Interface completa do pet
- **`Conta`**: Interface de conta de usuário
- **`Adotante`**: Interface de adotante
- **`ONG`**: Interface de ONG
- **`Endereco`**: Interface de endereço
- **Interfaces de Request/Response** para autenticação

---

## 🏗️ **Arquitetura e Padrões**

### **Padrão de Navegação:**

```
/ (index) → Redireciona conforme autenticação
├── /login → Tela de login
├── /register → Tela de cadastro
├── /home → Tela principal (autenticada)
└── /pet-details/[id] → Detalhes do pet
```

### **Fluxo de Dados:**

```
mockData → services → Screens → components
```

### **Gerenciamento de Estado:**

- **React Hooks** (useState, useEffect, useCallback)
- **AsyncStorage** para persistência local
- **Context implícito** via authService

### **Estilização:**

- **NativeWind** (Tailwind CSS para React Native)
- **StyleSheet** para estilos específicos
- **Tema consistente** com paleta de cores definida

---

## 🎯 **Funcionalidades por Tela**

### **🏠 Home.tsx**

- ✅ **Dois modos de visualização**: Swipe e Lista
- ✅ **Autenticação automática**: Verifica login
- ✅ **Dados dinâmicos**: Usa mockPets com características
- ✅ **Pull-to-refresh**: Atualiza lista de pets
- ✅ **Navegação**: Para detalhes do pet
- ✅ **Botões de ação**: Curtir/Rejeitar no modo swipe

### **🔐 Login.tsx**

- ✅ **Validação completa**: Email e senha
- ✅ **Botão demo**: Login automático para testes
- ✅ **Verificação de sessão**: Auto-login se logado
- ✅ **Estados de loading**: Feedback visual

### **📝 Register.tsx**

- ✅ **Cadastro duplo**: Adotantes e ONGs
- ✅ **Validação robusta**: Todos os campos
- ✅ **Formatação automática**: CNPJ, CEP, telefone
- ✅ **Endereço completo**: Todos os campos obrigatórios

### **🐾 PetDetailsScreen.tsx**

- ✅ **Informações completas**: Foto, dados, características
- ✅ **Status de saúde**: Vacinado/castrado
- ✅ **Contato com ONG**: Ligação e WhatsApp
- ✅ **Interface rica**: Chips de características

### **🧭 BottomNavigation.tsx**

- ✅ **Navegação contextual**: Diferente por tipo de usuário
- ✅ **Estado ativo**: Ícone destacado na rota atual
- ✅ **Design consistente**: Cores e espaçamento harmonioso

---

## 🚀 **Tecnologias Utilizadas**

### **Core:**

- **React Native** (Expo)
- **TypeScript**
- **Expo Router** (navegação)

### **UI/UX:**

- **NativeWind** (Tailwind CSS)
- **Expo Vector Icons**
- **React Native Animated API**

### **Dados:**

- **AsyncStorage** (persistência)
- **Mock Data** (desenvolvimento)

### **Ferramentas:**

- **Metro** (bundler)
- **Babel** (transpilação)
- **ESLint** (linting)

---

## 📋 **Checklist de Funcionalidades**

### ✅ **Implementado:**

- [x] Sistema de autenticação completo
- [x] Tela principal com dois modos (swipe/lista)
- [x] Detalhes completos dos pets
- [x] Navegação inferior responsiva
- [x] Pull-to-refresh
- [x] Dados mockados realistas
- [x] Validações robustas
- [x] Design responsivo
- [x] Estados de loading
- [x] Tratamento de erros

### 🔄 **Próximas Melhorias:**

- [ ] Integração com backend real
- [ ] Sistema de favoritos
- [ ] Filtros avançados
- [ ] Chat integrado
- [ ] Notificações push
- [ ] Mapas das ONGs
- [ ] Sistema de match avançado

---

## 🔧 **Como Navegar no Código**

### **Para adicionar uma nova tela:**

1. Criar arquivo em `Screens/`
2. Criar rota em `app/`
3. Adicionar navegação em `BottomNavigation` (se necessário)

### **Para adicionar novos dados:**

1. Definir interface em `types/types.ts`
2. Criar mock data em `mockData/`
3. Implementar service em `services/` (se necessário)

### **Para modificar estilos:**

1. **Global**: Editar `styles/global.css`
2. **Específico**: Usar StyleSheet na tela
3. **Componente**: NativeWind classes

---

**Autor**: Sistema PetHelper  
**Data**: Setembro 2025  
**Versão**: 1.0  
**TCC UNIP**
