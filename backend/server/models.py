from django.db import models
from django.contrib.postgres.fields import ArrayField
from uuid_extensions import uuid7
import os

def ong_image_path(instance, filename):
    return os.path.join('ong', str(instance.id), filename)


def pet_image_path(instance, filename):
    return os.path.join('pet', str(instance.id), filename)


class Conta(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    email = models.CharField(max_length=70, unique=True)
    senha = models.CharField(max_length=15)
    tipo = models.CharField(max_length=8, choices=[('ONG', 'ONG'), ('ADOTANTE', 'ADOTANTE')])
    data_cadastro = models.DateTimeField(auto_now_add=True)

class Endereco(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    logradouro = models.TextField()
    numero = models.CharField(max_length=10)
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    uf = models.CharField(max_length=2)
    cep = models.CharField(max_length=9)

class Ong(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    conta_id = models.OneToOneField(Conta, on_delete=models.CASCADE)
    nome_fantasia = models.TextField()
    cnpj = models.CharField(max_length=18, unique=True)
    telefone = models.CharField(max_length=30)
    endereco_id = models.OneToOneField(Endereco, on_delete=models.CASCADE)
    descricao = models.TextField(null=True, blank=True)
    imagem = models.ImageField(upload_to=ong_image_path, null=True, blank=True)

class Adotante(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    conta_id = models.OneToOneField(Conta, on_delete=models.CASCADE)
    nome = models.TextField()
    idade = models.IntegerField()
    telefone = models.CharField(max_length=30)
    vetor_caracteristicas = ArrayField(models.IntegerField())
    endereco_id = models.OneToOneField(Endereco, on_delete=models.CASCADE)

class Nota(models.Model):
    nota = models.FloatField()
    comentario = models.TextField(null=True, blank=True)
    data_avaliacao = models.DateTimeField(auto_now_add=True)
    adotante_id = models.ForeignKey(Adotante, on_delete=models.CASCADE)
    ong_id = models.ForeignKey(Ong, on_delete=models.CASCADE)

class Pets(models.Model):
    ong_id = models.ForeignKey(Ong, on_delete=models.CASCADE)
    adotante_id = models.ForeignKey(Adotante, on_delete=models.CASCADE, null=True, blank=True)
    nome = models.CharField(max_length=30)
    idade = models.IntegerField()
    descricao = models.TextField()
    disponivel = models.BooleanField(default=True)
    vetor_caracteristicas = ArrayField(models.IntegerField())
    imagem = models.ImageField(upload_to=pet_image_path, null=True, blank=True)