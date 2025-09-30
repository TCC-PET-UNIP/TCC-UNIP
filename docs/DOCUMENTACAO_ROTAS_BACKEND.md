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
    "email": "admin",
    "senha": "teste"
  },
  "nome_fantasia": "umnomefantasia",
  "cnpj": "99.999.999/9999-99",
  "telefone": "(99) 99999-9999",
  "endereco": {
    "logradouro": "Praça Quintino Bocaiúva",
    "numero": "688",
    "bairro": "Vila Arens I",
    "cidade": "Jundiaí",
    "uf": "SP",
    "cep": "13201-759"
  }
}
```

#### Response (201 Created):
```json
{
  "user": {
    "id": "068dc273-f2be-7f4e-8000-b9c0821c43ae",
    "nome_fantasia": "umnomefantasia",
    "cnpj": "99.999.999/9999-99",
    "telefone": "(99) 99999-9999",
    "endereco": {
      "id": "068dc273-f2b8-7800-8000-3b0fee1a843e",
      "logradouro": "Praça Quintino Bocaiúva",
      "numero": "688",
      "bairro": "Vila Arens I",
      "cidade": "Jundiaí",
      "uf": "SP",
      "cep": "13201-759"
    }
  },
  "refresh": "<token_refresh>",
  "access": "<token_access>"
}
```

#### Possíveis erros:
- `400 Bad Request` → Algum campo obrigatório está faltando ou inválido.
- `500 Internal Server Error` → Falha interna ao salvar os dados.

#### OBS:
- É encorajado o uso de storage local/cache para salvar os dados da requisição, pois não existem rotas específicas para retornar os dados dos usuarios

---

### 2. Registrar Adotante
- **Rota:** `/server/register_adopter`
- **Método:** `POST`
- **Descrição:** Cria uma conta para um adotante.

#### Request (JSON esperado):
```json
{
  "conta": {
    "email": "adotante@email.com",
    "senha": "teste123"
  },
  "nome": "John Doe da Silva",
  "idade": "24",
  "telefone": "(99) 99999-9999",
  "vetor_caracteristicas": [1,1,1,1,1],
  "endereco": {
    "logradouro": "Praça Quintino Bocaiúva",
    "numero": "688",
    "bairro": "Vila Arens I",
    "cidade": "Jundiaí",
    "uf": "SP",
    "cep": "13201-759"
  }
}
```

#### Response (201 Created):
```json
{
  "user": {
    "id": "068dc289-5d15-7a92-8000-597a4e6e2dbe",
    "nome": "John Doe da Silva",
    "idade": 24,
    "telefone": "(99) 99999-9999",
    "vetor_caracteristicas": [
      1,
      1,
      1,
      1,
      1
    ],
    "endereco": {
      "id": "068dc289-5d0c-7f00-8000-c1f47244d10e",
      "logradouro": "Praça Quintino Bocaiúva",
      "numero": "688",
      "bairro": "Vila Arens I",
      "cidade": "Jundiaí",
      "uf": "SP",
      "cep": "13201-759"
    }
  },
  "refresh": "<token_refresh>",
  "access": "<token_access>"
}
```

#### Possíveis erros:
- `400 Bad Request` → Algum campo obrigatório está faltando ou inválido.
- `500 Internal Server Error` → Falha interna ao salvar os dados.

#### OBS:
- É encorajado o uso de storage local/cache para salvar os dados da requisição, pois não existem rotas específicas para retornar os dados dos usuarios

---

### 3. Login
- **Rota:** `/server/login`
- **Método:** `POST`
- **Descrição:** Autentica um usuário cadastrado (ONG ou adotante).

#### Request:
```json
{
  "email": "adotante@email.com",
  "senha": "teste123"
}
```

#### Response (200 OK):
```json
{
  "user": {
    "ong": null,
    "adotante": {
      "id": "068dc289-5d15-7a92-8000-597a4e6e2dbe",
      "nome": "John Doe da Silva",
      "idade": 24,
      "telefone": "(99) 99999-9999",
      "vetor_caracteristicas": [
        1,
        1,
        1,
        1,
        1
      ],
      "endereco": {
        "id": "068dc289-5d0c-7f00-8000-c1f47244d10e",
        "logradouro": "Praça Quintino Bocaiúva",
        "numero": "688",
        "bairro": "Vila Arens I",
        "cidade": "Jundiaí",
        "uf": "SP",
        "cep": "13201-759"
      }
    }
  },
  "refresh": "<token_refresh>",
  "access": "<token_access>"
}
```

#### Possíveis erros:
- `401 Unauthorized` → Credenciais inválidas (email não encontrado ou senha incorreta).
- `400 Bad Request` → Estrutura do JSON incorreta.
- `500 Internal Server Error` → Falha interna ao salvar os dados.

#### OBS:
- É encorajado o uso de storage local/cache para salvar os dados da requisição, pois não existem rotas específicas para retornar os dados dos usuarios

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

OBS: Antes de qualquer passo certifique-se que tenha instalado o docker-desktop e o python. Caso desejar instale também o pgadmin

1. Clone o repositório:
   ```bash
   git clone https://github.com/TCC-PET-UNIP/TCC-UNIP.git
   ```
2. Acesse a pasta backend:
   ```bash
   cd backend
   ```
3. Instale as dependências:
   ```bashbackend/.gitignore
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
