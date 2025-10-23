from rest_framework import serializers
from .models import Conta, Endereco, Ong, Adotante, Nota, Pets

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    senha = serializers.CharField()

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conta
        fields = ['id', 'email', 'senha', 'tipo']
        read_only_fields = ['tipo']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = ['id', 'logradouro', 'numero', 'bairro', 'cidade', 'uf', 'cep']

class OngSerializer(serializers.ModelSerializer):
    conta = AccountSerializer(write_only=True)
    endereco = AddressSerializer(source='endereco_id')

    class Meta:
        model = Ong
        fields = ['id', 'conta', 'nome_fantasia', 'cnpj', 'telefone', 'endereco', 'imagem']

    def create(self, validated_data):
        conta_data = validated_data.pop('conta')
        endereco_data = validated_data.pop('endereco_id')

        conta = Conta.objects.create(**conta_data, tipo='ONG')
        endereco = Endereco.objects.create(**endereco_data)
        ong = Ong.objects.create(conta_id=conta, endereco_id=endereco, **validated_data)

        self._created_account = conta
        return ong

class AdotanteSerializer(serializers.ModelSerializer):
    conta = AccountSerializer(write_only=True)
    endereco = AddressSerializer(source='endereco_id')

    class Meta:
        model = Adotante
        fields = ['id', 'conta', 'nome', 'idade', 'telefone', 'vetor_caracteristicas', 'endereco']
    
    def create(self, validated_data):
        conta_data = validated_data.pop('conta')
        endereco_data = validated_data.pop('endereco_id')

        conta = Conta.objects.create(**conta_data, tipo='ADOTANTE')
        endereco = Endereco.objects.create(**endereco_data)
        adotante = Adotante.objects.create(conta_id=conta, endereco_id=endereco, **validated_data)

        self._created_account = conta
        return adotante

class AccountOutputSerializer(serializers.ModelSerializer):
    ong = OngSerializer()
    adotante = AdotanteSerializer()

    class Meta:
        model = Conta
        fields = ['ong','adotante']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nota
        fields = '__all__'

class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pets
        fields = '__all__'

class ongUpdateImageSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Ong
        fields = ['id','imagem']

class petUpdateImageSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Pets
        fields = ['id','imagem']