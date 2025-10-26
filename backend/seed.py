import random
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from server.models import Conta, Ong, Adotante, Pets, Endereco

def reset_database():
    print("🧹 Limpando dados existentes...")
    Pets.objects.all().delete()
    Endereco.objects.all().delete()
    Ong.objects.all().delete()
    Adotante.objects.all().delete()
    Conta.objects.all().delete()

def create_enderecos(qtd=3):
    print("🏠 Criando endereços...")
    enderecos = []
    for i in range(qtd):
        enderecos.append(
            Endereco.objects.create(
                logradouro=f"Rua Exemplo {i+1}",
                numero=str(random.randint(10, 999)),
                bairro="Centro",
                cidade="São Paulo",
                uf="SP",
                cep="01000-000",
            )
        )
    return enderecos

def create_contas(tipo, qtd=3):
    print(f"👤 Criando contas do tipo {tipo}...")
    contas = []
    for i in range(qtd):
        conta = Conta.objects.create_user(
            email=f"{tipo.lower()}{i+1}@email.com",
            senha="123456",
            tipo=tipo.upper(),
        )
        contas.append(conta)
    return contas

def seed_ongs(contas, enderecos):
    print("🐾 Criando ONGs...")
    ongs = []
    for i, conta in enumerate(contas):
        ong = Ong.objects.create(
            conta_id=conta,
            nome_fantasia=f"ONG Amigo Pet {i+1}",
            cnpj=f"00.000.000/000{i+1}-00",
            telefone=f"(11) 99999-00{i+1}",
            endereco_id=enderecos[i % len(enderecos)],
            descricao="ONG dedicada ao resgate e adoção de animais.",
        )
        ongs.append(ong)
    return ongs

def seed_adotantes(contas, enderecos):
    print("🧍 Criando adotantes...")
    adotantes = []
    for i, conta in enumerate(contas):
        vetor = [
            random.uniform(1, 5),  # Tipo Imóvel
            random.choice([0, 1]),  # Área Externa
            random.choice([0, 1]),  # Imóvel Telado
            random.randint(1, 6),   # Moradores
            random.choice([0, 1]),  # Crianças
            random.choice([0, 1]),  # Idosos
            random.choice([0, 1]),  # Outros Animais
            random.randint(1, 5),   # Experiência
            random.randint(1, 5),   # Tempo Disponível
            random.randint(1, 5),   # Tempo Fora
            random.choice([0, 1]),  # Aceita Espécie
            random.choice([1, 3, 5]),  # Gastos Mensais
            random.choice([0, 1])   # Experiência Prévia
        ]
       
        adotantes.append(
            Adotante.objects.create(
                conta_id=conta,
                nome=f"Adotante {i+1}",
                idade=f"{20+i}",
                telefone=f"(11) 98888-00{i+1}",
                endereco_id=enderecos[i % len(enderecos)],
                vetor_caracteristicas=vetor,
            )
        )
    return adotantes

def seed_pets(ongs):
    print("🐶 Criando pets...")

    pet_dados = [
        {"nome": "Mia", "idade": 2, "descricao": "Abuso anterior", "vetor_caracteristicas": [0.0, 2.0, 0.0, 1.0, 1.0, 0.0, 0.0], },
        {"nome": "Luna", "idade": 4, "descricao": "Experiência negativa Asma felina Corticosteroides", "vetor_caracteristicas": [0.0, 3.0, 1.0, 1.0, 0.0, 1.0, 1.0], },
        {"nome": "Tom", "idade": 3, "descricao": "Animal aguardando adoção.", "vetor_caracteristicas": [0.0, 3.0, 0.0, 0.0, 0.0, 0.0, 0.0], },
        {"nome": "Nina", "idade": 5, "descricao": "Ataque anterior", "vetor_caracteristicas": [0.0, 2.0, 0.0, 1.0, 1.0, 1.0, 0.0], },
        {"nome": "Bento", "idade": 1, "descricao": "Surdez", "vetor_caracteristicas": [0.0, 2.0, 1.0, 0.0, 1.0, 1.0, 0.0], },
        {"nome": "Mel", "idade": 6, "descricao": "Ração especial e medicação Doença renal crônica", "vetor_caracteristicas": [0.0, 3.0, 1.0, 0.0, 1.0, 1.0, 0.0], },
        {"nome": "Oliver", "idade": 6, "descricao": "Barulhos altos", "vetor_caracteristicas": [0.0, 3.0, 0.0, 1.0, 1.0, 1.0, 0.0], },
        {"nome": "Sofia", "idade": 4, "descricao": "Animal aguardando adoção.", "vetor_caracteristicas": [0.0, 3.0, 0.0, 0.0, 1.0, 1.0, 0.0], },
        {"nome": "Chico", "idade": 4, "descricao": "Animal aguardando adoção.", "vetor_caracteristicas": [0.0, 4.0, 0.0, 0.0, 1.0, 1.0, 0.0], },
        {"nome": "Jade", "idade": 7, "descricao": "Experiência negativa Insulina Diabetes felina Cego", "vetor_caracteristicas": [0.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0], },
        {"nome": "Thor", "idade": 5, "descricao": "Abuso anterior Anti-inflamatórios Artrite", "vetor_caracteristicas": [1.0, 5.0, 1.0, 1.0, 1.0, 1.0, 1.0], },
        {"nome": "Lola", "idade": 2, "descricao": "Abuso anterior", "vetor_caracteristicas": [1.0, 2.0, 0.0, 1.0, 1.0, 1.0, 0.0], },
        {"nome": "Max", "idade": 4, "descricao": "Animal aguardando adoção.", "vetor_caracteristicas": [1.0, 3.0, 0.0, 0.0, 1.0, 1.0, 0.0], },
        {"nome": "Belinha", "idade": 6, "descricao": "Ataque anterior Medicação diária Doença cardíaca", "vetor_caracteristicas": [1.0, 3.0, 1.0, 1.0, 0.0, 0.0, 1.0], },
        {"nome": "Rex", "idade": 6, "descricao": "Ausência de membro", "vetor_caracteristicas": [1.0, 6.0, 1.0, 0.0, 1.0, 1.0, 0.0], },
        {"nome": "Amora", "idade": 1, "descricao": "Animal aguardando adoção.", "vetor_caracteristicas": [1.0, 3.0, 0.0, 0.0, 1.0, 1.0, 0.0], },
        {"nome": "Fred", "idade": 7, "descricao": "Experiência negativa", "vetor_caracteristicas": [1.0, 4.0, 0.0, 1.0, 0.0, 1.0, 1.0], },
        {"nome": "Pipoca", "idade": 3, "descricao": "Ração hipoalergênica Alergia alimentar", "vetor_caracteristicas": [1.0, 3.0, 1.0, 0.0, 1.0, 1.0, 0.0], },
        {"nome": "Duke", "idade": 4, "descricao": "Atropelamento anterior Paraplégico", "vetor_caracteristicas": [1.0, 4.0, 1.0, 1.0, 1.0, 1.0, 1.0], },
        {"nome": "Fiona", "idade": 5, "descricao": "Ano novo traumático Medo de fogos", "vetor_caracteristicas": [1.0, 3.0, 0.0, 1.0, 1.0, 0.0, 0.0], },
    ]

    for i, data in enumerate(pet_dados):
        ong = ongs[i % len(ongs)]
        Pets.objects.create(
            ong_id=ong,
            nome=data["nome"],
            idade=data["idade"],
            descricao=data["descricao"],
            disponivel=True,
            vetor_caracteristicas=data["vetor_caracteristicas"],
        )

    print(f"✅ {len(pet_dados)} pets criados com sucesso.")

def run_seed():
    print("🚀 Iniciando seed do banco de dados...")

    reset_database()
    enderecos = create_enderecos(qtd=3)
    contas_ongs = create_contas("ONG", qtd=3)
    contas_adotantes = create_contas("ADOTANTE", qtd=3)

    ongs = seed_ongs(contas_ongs, enderecos)
    seed_adotantes(contas_adotantes, enderecos)
    seed_pets(ongs)

    print("🌱 SEED COMPLETO! Dados populados com sucesso.")

if __name__ == "__main__":
    run_seed()