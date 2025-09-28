# 🐾 API de Adoção de Pets

Esta API foi desenvolvida em **Django Rest Framework** e fornece alguns endpoints.

Todos os endpoints estão sob o prefixo:

```
/server/
```

Exemplo de rota completa:

```
http://localhost:8000/server/rota_generica
```

---

## 🚀 Endpoints disponíveis

### 1. Registrar ONG
- **Rota:** `/server/register_ong`
- **Método:** `POST`
- **Descrição:** Cria uma conta para uma ONG no sistema.

#### Request (JSON esperado):
```json
{
  "conta": {
    "email": "contato@ong.com",
    "senha": "senha123"
  },
  "nome_fantasia": "ONG Exemplo",
  "cnpj": "12.345.678/0001-99",
  "telefone": "(11) 99999-9999",
  "endereco": {
    "logradouro": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "uf": "SP",
    "cep": "01000-000"
  }
}
```

#### Response (201 Created):
```json
{
  "user": {
    "id": 1,
    "nome_fantasia": "ONG Exemplo",
    "cnpj": "12.345.678/0001-99",
    "telefone": "(11) 99999-9999"
  },
  "refresh": "<token_refresh>",
  "access": "<token_access>"
}
```

#### Possíveis erros:
- `400 Bad Request` → Algum campo obrigatório está faltando ou inválido.
- `500 Internal Server Error` → Falha interna ao salvar os dados.

---

### 2. Registrar Adotante
- **Rota:** `/server/register_adopter`
- **Método:** `POST`
- **Descrição:** Cria uma conta para um adotante (pessoa interessada em adotar).

#### Request (JSON esperado):
```json
{
  "conta": {
    "email": "joao@email.com",
    "senha": "senha123"
  },
  "nome": "João Silva",
  "idade": "30",
  "telefone": "(11) 98888-7777",
  "vetor_caracteristicas": [0,1,4,6,2,1,5],
  "endereco": {
    "logradouro": "Rua das Palmeiras",
    "numero": "45",
    "bairro": "Jardins",
    "cidade": "São Paulo",
    "uf": "SP",
    "cep": "01400-000"
  }
}
```

#### Response (201 Created):
```json
{
  "user": {
    "id": "2",
    "nome": "João Silva",
    "idade": "30",
    "telefone": "(11) 98888-7777",
    "vetor_caracteristicas": "responsável, carinhoso"
  },
  "refresh": "<token_refresh>",
  "access": "<token_access>"
}
```

#### Possíveis erros:
- `400 Bad Request` → Algum campo obrigatório está faltando ou inválido.
- `500 Internal Server Error` → Falha interna ao salvar os dados.

---

### 3. Login
- **Rota:** `/server/login`
- **Método:** `POST`
- **Descrição:** Autentica um usuário cadastrado (ONG ou adotante).

#### Request:
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

#### Response (200 OK):
```json
{
  "user": {
    "id": 2,
    "email": "joao@email.com",
    "senha": "senha123",
    "tipo": "ADOTANTE"
  },
  "refresh": "<token_refresh>",
  "access": "<token_access>"
}
```

#### Possíveis erros:
- `401 Unauthorized` → Credenciais inválidas (email não encontrado ou senha incorreta).
- `400 Bad Request` → Estrutura do JSON incorreta.

---

### 4. Health Check
- **Rota:** `/server/health`
- **Método:** `GET`
- **Descrição:** Verifica se o servidor está funcionando.

#### Request:
```bash
curl -X GET http://localhost:8000/server/health
```

#### Response (200 OK):
```json
{
  "status": "ok"
}
```

#### Possíveis erros:
- Esse endpoint não gera erros, apenas confirma se o servidor está ativo.

---

## 🔑 Autenticação

Após o **cadastro** ou **login**, a API retorna dois tokens:

- `refresh`: usado para gerar novos tokens
- `access`: usado para autenticar requisições

Para acessar endpoints protegidos, adicione o header:

```
Authorization: Bearer <access_token>
```

---

## 🛠️ Tecnologias utilizadas
- **Django** + **Django Rest Framework**
- **JWT (JSON Web Tokens)** para autenticação
- **PostgreSQL** (ou outro banco configurado no projeto)

---

## 👨‍💻 Como rodar o projeto localmente

OBS: Antes de qualquer passo certifique-se que tenha instalado o docker-desktop e o python

1. Clone o repositório:
   ```bash
   git clone https://github.com/TCC-PET-UNIP/TCC-UNIP.git
   ```
2. Acesse a pasta backend:
   ```bash
   cd backend
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Inicie o container docker:
   ```bash
   docker-compose up -d
   ```
5. Aplique as migrações:
   ```bash
   python manage.py migrate
   ```
6. Rode o servidor:
   ```bash
   python manage.py runserver
   ```

O servidor estará disponível em:
```
http://localhost:8000
```
