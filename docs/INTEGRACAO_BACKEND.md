# 🔄 Integração Frontend-Backend

## ✅ Status da Integração

A integração com o backend Django está **COMPLETA** para os seguintes endpoints:

- ✅ **Login** (`/server/login`)
- ✅ **Cadastro de Adotante** (`/server/register_adopter`)
- ✅ **Cadastro de ONG** (`/server/register_ong`)
- ✅ **Health Check** (`/server/health`)

---

## 🚀 Como Rodar o Backend

### Pré-requisitos:
- Docker Desktop instalado
- Python 3.x instalado
- PostgreSQL (via Docker)

### Passos:

1. **Navegar para a pasta backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Iniciar o container Docker (PostgreSQL):**
   ```bash
   docker-compose up -d
   ```

4. **Aplicar migrações do banco de dados:**
   ```bash
   python manage.py migrate
   ```

5. **Rodar o servidor Django:**
   ```bash
   python manage.py runserver
   ```

6. **Verificar se está funcionando:**
   ```bash
   curl http://localhost:8000/server/health
   ```
   
   Resposta esperada:
   ```json
   {"status": "ok"}
   ```

---

## 📱 Como Rodar o Frontend

1. **Navegar para a pasta frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o Expo:**
   ```bash
   npx expo start
   ```

4. **Escolher uma opção:**
   - Pressione `a` para Android Emulator
   - Pressione `i` para iOS Simulator
   - Escaneie o QR Code com o app Expo Go

---

## 🔧 Configuração da API

O endereço da API está configurado em:
```
frontend/services/apiConfig.ts
```

**URL atual:**
```typescript
BASE_URL: "http://localhost:8000/server"
```

### ⚠️ Importante para dispositivos físicos:

Se você estiver testando em um dispositivo físico (celular), precisa usar o IP da sua máquina ao invés de `localhost`:

1. Descubra seu IP local:
   - Windows: `ipconfig` (procure por "Endereço IPv4")
   - Mac/Linux: `ifconfig` ou `ip addr`

2. Atualize o `apiConfig.ts`:
   ```typescript
   BASE_URL: "http://SEU_IP:8000/server"
   ```
   
   Exemplo:
   ```typescript
   BASE_URL: "http://192.168.1.100:8000/server"
   ```

---

## 🧪 Testando a Integração

### 1. Cadastro de Adotante:
Na tela de Register, escolha "ADOTANTE" e preencha os dados. O app agora enviará os dados para o backend real.

### 2. Cadastro de ONG:
Na tela de Register, escolha "ONG" e preencha os dados incluindo CNPJ.

### 3. Login:
Use as credenciais criadas para fazer login. O token JWT será salvo automaticamente.

---

## 📝 Dados Salvos

Após login/cadastro bem-sucedido, os seguintes dados são salvos no AsyncStorage:

- `userToken` - Token de acesso JWT
- `refreshToken` - Token de refresh JWT
- `userProfile` - Dados completos do usuário

---

## 🐛 Troubleshooting

### Erro: "Network request failed"
- ✅ Verifique se o backend está rodando
- ✅ Verifique se a URL está correta
- ✅ Se estiver em dispositivo físico, use o IP da máquina

### Erro: "Cannot connect to localhost"
- ✅ Se estiver em emulador Android, use `http://10.0.2.2:8000`
- ✅ Se estiver em dispositivo físico, use o IP da sua máquina

### Erro: "CORS Policy"
- ✅ Verifique se `django-cors-headers` está instalado
- ✅ Verifique configurações de CORS no `settings.py`

---

## 📊 Arquivos Modificados

### Novos arquivos:
- ✅ `frontend/services/apiConfig.ts` - Configuração centralizada da API

### Arquivos atualizados:
- ✅ `frontend/services/authService.ts` - Integrado com backend real
- ✅ `frontend/services/authService.mock.ts` - Backup dos dados mockados

---

## 🔮 Próximos Passos

Endpoints que ainda precisam ser implementados:

- 🔲 Listar pets
- 🔲 Adicionar pet (ONG)
- 🔲 Editar pet (ONG)
- 🔲 Remover pet (ONG)
- 🔲 Buscar pets por filtro
- 🔲 Atualizar perfil de usuário
- 🔲 Upload de imagens

---

## ✨ Funcionalidades Prontas

- ✅ Login com JWT
- ✅ Cadastro de Adotante
- ✅ Cadastro de ONG
- ✅ Validações no frontend
- ✅ Tratamento de erros
- ✅ Mensagens amigáveis ao usuário
- ✅ Health check do backend
