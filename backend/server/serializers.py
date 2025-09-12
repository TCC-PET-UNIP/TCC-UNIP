from rest_framework import serializers
from .models import Conta, Endereco, Ong, Adotante, Nota, Pets

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conta
        fields = '__all__'

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = '__all__'

class OngSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ong
        fields = '__all__'

class AdotanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adotante
        fields = '__all__'

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nota
        fields = '__all__'

class PetsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pets
        fields = '__all__'