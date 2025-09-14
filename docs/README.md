# Documentação - PetHelper TCC UNIP

Bem-vindo à documentação completa do projeto PetHelper, desenvolvido como Trabalho de Conclusão de Curso (TCC) da UNIP.

## 📁 Estrutura da Documentação

### 📋 Documentos Disponíveis

1. **[Documentação da Estrutura Frontend](DOCUMENTACAO_ESTRUTURA_FRONTEND.md)**

   - Estrutura completa de pastas do frontend
   - Descrição detalhada de cada componente
   - Arquitetura e padrões utilizados
   - Tecnologias implementadas

2. **[Documentação do Sistema de Autenticação](DOCUMENTACAO_AUTENTICACAO.md)**
   - Implementação completa do login e cadastro
   - Fluxos de validação e segurança
   - Estrutura de tipos TypeScript
   - Boas práticas implementadas

## 🚀 Sobre o Projeto

O **PetHelper** é um aplicativo móvel desenvolvido em React Native que conecta pessoas interessadas em adotar pets com ONGs de proteção animal. O projeto utiliza tecnologias modernas e segue boas práticas de desenvolvimento.

### 🎯 Objetivos Principais

- Facilitar o processo de adoção de animais
- Conectar adotantes com ONGs de forma eficiente
- Proporcionar uma experiência de usuário intuitiva
- Implementar sistema de matching baseado em características

### 🛠️ Tecnologias Utilizadas

#### Frontend (React Native)

- **React Native** com **Expo**
- **TypeScript** para tipagem estática
- **Expo Router** para navegação
- **NativeWind** (Tailwind CSS) para estilização
- **AsyncStorage** para persistência local

#### Backend (Django)

- **Django** com **Django REST Framework**
- **PostgreSQL** como banco de dados
- **Docker** para containerização

## 📱 Funcionalidades Implementadas

### ✅ Sistema de Autenticação

- Login e cadastro para adotantes e ONGs
- Validação robusta de dados
- Persistência de sessão
- Demo login para testes

### ✅ Descoberta de Pets

- Modo swipe (estilo Tinder)
- Modo lista detalhado
- Sistema de características
- Refresh para novos pets

### ✅ Detalhes dos Pets

- Informações completas
- Status de saúde
- Contato direto com ONG
- Chips de características

### ✅ Navegação

- Bottom navigation contextual
- Rotas dinâmicas
- Estados de loading

## 📖 Como Navegar na Documentação

### 🔍 Para Desenvolvedores

1. **Iniciando no projeto**: Leia a [Documentação da Estrutura Frontend](DOCUMENTACAO_ESTRUTURA_FRONTEND.md)
2. **Implementando autenticação**: Consulte a [Documentação do Sistema de Autenticação](DOCUMENTACAO_AUTENTICACAO.md)
3. **Adicionando novas funcionalidades**: Verifique os padrões estabelecidos na documentação de estrutura

### 🎨 Para Designers/UX

- Cores principais: `#B87B56`, `#8DC6CE`, `#ad3434`, `#F8F3EC`
- Componentes reutilizáveis em `frontend/components/`
- Padrões de navegação documentados

### 📊 Para Analistas

- Fluxos de usuário documentados
- Validações implementadas
- Estados de erro e loading

## 🏗️ Arquitetura do Projeto

```
TCC-UNIP/
├── backend/          # API Django
├── frontend/         # App React Native
├── docs/            # Documentação completa
└── README.md        # Visão geral do projeto
```

## 🔄 Versionamento da Documentação

- **Versão 1.0** (Setembro 2025): Documentação inicial
- Atualizações futuras serão versionadas conforme desenvolvimento

## 📞 Suporte e Contato

Para dúvidas sobre a documentação ou implementação:

- **Projeto**: PetHelper TCC UNIP
- **Tecnologias**: React Native, Django, PostgreSQL
- **Padrões**: TypeScript, Clean Code, Component Architecture

## 🎯 Próximos Passos

### 📋 Documentação Futura

- [ ] Documentação da API Backend
- [ ] Guia de Deployment
- [ ] Manual do Usuário
- [ ] Testes Automatizados
- [ ] Performance e Otimização

### 🚀 Funcionalidades Futuras

- [ ] Sistema de Favoritos
- [ ] Chat entre adotantes e ONGs
- [ ] Notificações Push
- [ ] Mapas e Localização
- [ ] Sistema de Avaliação

---

**Projeto**: PetHelper - Facilitando a adoção de pets  
**Instituição**: UNIP (Universidade Paulista)  
**Curso**: Análise e Desenvolvimento de Sistemas  
**Ano**: 2025

---

_Esta documentação é mantida atualizada conforme o desenvolvimento do projeto._
