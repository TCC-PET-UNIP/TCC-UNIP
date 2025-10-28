from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from uuid_extensions import uuid7
import os
import shutil

def ong_image_path(instance, filename):
    return os.path.join('ong', str(instance.id), filename)

def pet_image_path(instance, filename):
    return os.path.join('pet', 'temp', filename)


class ContaManager(BaseUserManager):
    def create_user(self, email, senha=None, **extra_fields):
        if not email:
            raise ValueError("O campo email é obrigatório")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(senha)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, senha=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, senha, **extra_fields)

class Conta(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    email = models.CharField(max_length=70, unique=True)
    tipo = models.CharField(max_length=8, choices=[('ONG', 'ONG'), ('ADOTANTE', 'ADOTANTE')])
    data_cadastro = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = ContaManager()

    def __str__(self):
        return self.email

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
    raca = models.CharField(null= True)
    sexo = models.CharField(max_length=5, choices=[('Macho', 'Macho'), ('Femea', 'Femea')], null= True)
    disponivel = models.BooleanField(default=True)
    vetor_caracteristicas = ArrayField(models.IntegerField())
    imagem = models.ImageField(upload_to=pet_image_path, null=True, blank=True)

    def save(self, *args, **kwargs):
        creating = self._state.adding
        super().save(*args, **kwargs)

        # Quando o objeto for criado pela primeira vez, renomeia a imagem
        if creating and self.imagem:
            old_path = self.imagem.path
            new_dir = os.path.join('media', 'pet', str(self.id))
            os.makedirs(new_dir, exist_ok=True)

            new_path = os.path.join(new_dir, os.path.basename(old_path))
            shutil.move(old_path, new_path)

            # Atualiza o caminho no model
            self.imagem.name = os.path.relpath(new_path, 'media')
            super().save(update_fields=['imagem'])