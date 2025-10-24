# 🐾 API de Adoção de Pets

Esta API foi desenvolvida em **Django Rest Framework** e fornece alguns endpoints.

Todos os endpoints estão sob o prefixo:

```
/server/
```

Exemplo de rota completa:

```
http://localhost:8000/server/register_ong
```

---

## 🚀 Endpoints disponíveis

### 1. Registrar ONG
- **Rota:** `/server/register_ong`
- **Método:** `POST`
- **Descrição:** Cria uma conta para uma ONG no sistema.

#### Request:
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

### 2. Atualizar ONG
- **Rota:** `/server/update_ong_data`
- **Método:** `PATCH`
- **Descrição:** Atualiza qualquer dado da ONG (nome, CNPJ, telefone, descrição, imagem ou endereço).

#### Request (multipart/form-data):
```
id: <uuid-da-ong>
nome_fantasia: ONG Esperança Renovada
telefone: (11) 99999-8888
descricao: Nova descrição
imagem: [arquivo.jpg]
endereco.logradouro: Rua Nova
endereco.cidade: Jundiaí
```

#### Response (200 OK):
```json
{
  "message": "Dados da ONG atualizados com sucesso!"
}
```

#### Possíveis erros:
- **400 Bad Request:** Dados ausentes, inválidos ou com formato incorreto.
- **401 Unauthorized:** Token de autenticação ausente ou inválido.
- **403 Forbidden:** Usuário sem permissão para realizar esta ação.
- **404 Not Found:** Recurso (ONG, adotante ou pet) não encontrado.
- **500 Internal Server Error:** Erro interno no servidor.

---

### 3. Registrar Adotante
- **Rota:** `/server/register_adopter`
- **Método:** `POST`
- **Descrição:** Cria uma conta para um adotante.

#### Request:
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

### 4. Atualizar Adotante
- **Rota:** `/server/update_adopter_data`
- **Método:** `PATCH`
- **Descrição:** Atualiza dados do adotante, inclusive endereço.

#### Request:
```json
{
  "id": "uuid-do-adotante",
  "nome": "Maria S. Lima",
  "idade": 31,
  "telefone": "(11) 97777-7777",
  "vetor_caracteristicas": [2, 3, 4, 5, 1],
  "endereco": {
    "logradouro": "Rua das Margaridas",
    "numero": "200",
    "bairro": "Jardins"
  }
}
```

#### Response (200 OK):
```json
{
  "message": "Dados do adotante atualizados com sucesso!"
}
```

#### Possíveis erros:
- **400 Bad Request:** Dados ausentes, inválidos ou com formato incorreto.
- **401 Unauthorized:** Token de autenticação ausente ou inválido.
- **403 Forbidden:** Usuário sem permissão para realizar esta ação.
- **404 Not Found:** Recurso (ONG, adotante ou pet) não encontrado.
- **500 Internal Server Error:** Erro interno no servidor.

---

### 5. Registrar Pet
- **Rota:** `/server/register_pet`
- **Método:** `POST`
- **Descrição:** Cria um pet vinculado a uma ONG.

#### Request (multipart/form-data):
```
ong_id: <uuid-da-ong>
nome: Rex
idade: 3
descricao: Cachorro dócil e brincalhão
disponivel: True
imagem: [arquivo.jpg]
```

#### Response (201 Created):
```json
{
  "id": 1,
  "ong_id": "uuid-da-ong",
  "adotante_id": null,
  "nome": "Rex",
  "idade": 3,
  "descricao": "Cachorro dócil e brincalhão",
  "disponivel": true,
  "vetor_caracteristicas": [1, 1, 1, 1, 2, 2],
  "imagem": "pet/<id>/imagem_pet.jpg"
}
```

#### Possíveis erros:
- **400 Bad Request:** Dados ausentes, inválidos ou com formato incorreto.
- **401 Unauthorized:** Token de autenticação ausente ou inválido.
- **403 Forbidden:** Usuário sem permissão para realizar esta ação.
- **404 Not Found:** Recurso (ONG, adotante ou pet) não encontrado.
- **500 Internal Server Error:** Erro interno no servidor.

---

### 6. Atualizar Pet
- **Rota:** `/server/update_pet_data`
- **Método:** `PATCH`
- **Descrição:** Atualiza qualquer informação do pet (nome, idade, descrição, imagem, etc.).

#### Request (multipart/form-data):
```
id: 1
nome: Rex atualizado
descricao: Agora mais calmo
imagem: [novo_arquivo.jpg]
```

#### Response (200 OK):
```json
{
  "message": "Dados do pet atualizados com sucesso!"
}
```

#### Possíveis erros:
- **400 Bad Request:** Dados ausentes, inválidos ou com formato incorreto.
- **401 Unauthorized:** Token de autenticação ausente ou inválido.
- **403 Forbidden:** Usuário sem permissão para realizar esta ação.
- **404 Not Found:** Recurso (ONG, adotante ou pet) não encontrado.
- **500 Internal Server Error:** Erro interno no servidor.

---

### 7. Retornar pets compatíveis pela IA
- **Rota:** `/server/get_compatible_pets`  
- **Método:** `POST`  
- **Descrição:** Utiliza o modelo de IA para identificar e retornar os pets mais compatíveis com um adotante, com base no vetor de características do adotante e dos pets cadastrados.  
- **Requisitos:** O modelo de compatibilidade (`compatibility_model_final_weights.pth`) deve estar carregado corretamente no servidor.

#### Request:
```json
{
  "adotante_id": "uuid-do-adotante"
}
```

#### Response (200 OK):

```json
{
  "adotante_id": "uuid-do-adotante",
  "total_pets_compatíveis": 2,
  "pets": [
    {
      "id": "uuid-do-pet-1",
      "ong_id": "uuid-da-ong",
      "adotante_id": null,
      "nome": "Rex",
      "idade": 3,
      "descricao": "Cachorro dócil e brincalhão",
      "disponivel": true,
      "vetor_caracteristicas": [1, 3, 5, 1, 2, 0, 1],
      "imagem": "/media/pet/uuid-do-pet-1/imagem_pet.jpg"
    },
    {
      "id": "uuid-do-pet-2",
      "ong_id": "uuid-da-ong",
      "adotante_id": null,
      "nome": "Luna",
      "idade": 2,
      "descricao": "Gata calma e carinhosa",
      "disponivel": true,
      "vetor_caracteristicas": [0, 4, 2, 1, 1, 0, 0],
      "imagem": "/media/pet/uuid-do-pet-2/imagem_pet.jpg"
    }
  ]
}
```

#### Possíveis erros:
- **400 Bad Request:** Dados ausentes, inválidos ou com formato incorreto.
- **401 Unauthorized:** Token de autenticação ausente ou inválido.
- **403 Forbidden:** Usuário sem permissão para realizar esta ação.
- **500 Internal Server Error:** Erro interno no servidor.

---

### 8. Login
- **Rota:** `/server/login`
- **Método:** `POST`
- **Descrição:** Autentica uma conta (ONG ou adotante).

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

### 9. Health Check
- **Rota:** `/server/health`
- **Método:** `GET`
- **Descrição:** Verifica se o servidor está online.

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
