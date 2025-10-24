from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import OngSerializer, AdotanteSerializer, LoginSerializer, AccountOutputSerializer, OngUpdateSerializer, AdopterUpdateSerializer, PetUpdateSerializer, PetSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Conta, Ong, Pets, Adotante

@api_view(['POST'])
def register_ong(req):
    serializer = OngSerializer(data=req.data)
    serializer.is_valid(raise_exception=True) # Retorna 400 automaticamente se algum dos campos for inválido
    ong = serializer.save()

    JWT_token = RefreshToken.for_user(serializer._created_account)
    
    return Response({
        'user': serializer.data,
        'refresh': str(JWT_token),
        'access': str(JWT_token.access_token)
    }, status=status.HTTP_201_CREATED)

# Verificar seguraça com JWT depois
@api_view(['PATCH'])
def update_ong_data(req):
    serializer = OngUpdateSerializer(data=req.data, partial=True)
    serializer.is_valid(raise_exception=True)

    ong_id = serializer.validated_data.pop('id')

    try:
        ong = Ong.objects.get(id=ong_id)
    except Ong.DoesNotExist:
        return Response({"error": "ONG não encontrada"}, status=status.HTTP_404_NOT_FOUND)

    # --- Atualiza o endereço, se veio ---
    endereco_data = serializer.validated_data.pop('endereco_id', None)
    if endereco_data:
        endereco = ong.endereco_id
        for field, value in endereco_data.items():
            setattr(endereco, field, value)
        endereco.save()

    # --- Atualiza os demais campos da ONG ---
    for field, value in serializer.validated_data.items():
        setattr(ong, field, value)
    ong.save()

    return Response({"message": "Dados da ONG atualizados com sucesso!"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def register_adopter(req):
    serializer = AdotanteSerializer(data=req.data)
    serializer.is_valid(raise_exception=True) # Retorna 400 automaticamente se algum dos campos for inválido
    adopter = serializer.save()

    JWT_token = RefreshToken.for_user(serializer._created_account)

    return Response({
        'user': serializer.data,
        'refresh': str(JWT_token),
        'access': str(JWT_token.access_token)
    }, status=status.HTTP_201_CREATED)

# Verificar seguraça com JWT depois
@api_view(['PATCH'])
def update_adopter_data(req):
    serializer = AdopterUpdateSerializer(data=req.data, partial=True)
    serializer.is_valid(raise_exception=True)

    adopter_id = serializer.validated_data.pop('id')

    try:
        adopter = Adotante.objects.get(id=adopter_id)
    except Adotante.DoesNotExist:
        return Response({"error": "Adotante não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    # --- Atualiza o endereço, se veio ---
    endereco_data = serializer.validated_data.pop('endereco_id', None)
    if endereco_data:
        endereco = adopter.endereco_id
        for field, value in endereco_data.items():
            setattr(endereco, field, value)
        endereco.save()

    # --- Atualiza os demais campos do adotante ---
    for field, value in serializer.validated_data.items():
        setattr(adopter, field, value)
    adopter.save()

    return Response({"message": "Dados do adotante atualizados com sucesso!"}, status=status.HTTP_200_OK)


# Verificar seguraça com JWT depois
@api_view(['POST'])
def register_pet(req):
    data = dict(req.data)

    if not data.get('vetor_caracteristicas'):
        data['vetor_caracteristicas'] = [1, 1, 1, 1, 2, 2]

    for key, value in data.items():
        # Exemplo: {'nome': ['Rex']} -> 'Rex'
        if isinstance(value, list) and len(value) == 1:
            data[key] = value[0]

    serializer = PetSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    
    return Response(serializer.data, status=status.HTTP_201_CREATED)

# Verificar seguraça com JWT depois
@api_view(['PATCH'])
def update_pet_data(req):
    serializer = PetUpdateSerializer(data=req.data, partial=True)
    serializer.is_valid(raise_exception=True)

    pet_id = serializer.validated_data.pop('id')

    try:
        pet = Pets.objects.get(id=pet_id)
    except Pets.DoesNotExist:
        return Response({"error": "Pet não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    # --- Atualiza os demais campos do pet ---
    for field, value in serializer.validated_data.items():
        setattr(pet, field, value)
    pet.save()

    return Response({"message": "Dados do pet atualizados com sucesso!"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def login(req):
    serializer = LoginSerializer(data=req.data)
    serializer.is_valid(raise_exception=True) # Retorna 400 automaticamente se algum dos campos for inválido

    email = serializer.validated_data['email']
    senha = serializer.validated_data['senha']

    try:
        account = Conta.objects.select_related("ong__endereco_id", "adotante__endereco_id").get(email=email)
    except Conta.DoesNotExist:
        return Response({"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

    if account.senha != senha:
        return Response({"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

    JWT_token = RefreshToken.for_user(account)

    return Response({
        'user': AccountOutputSerializer(account).data,
        'refresh': str(JWT_token),
        'access': str(JWT_token.access_token)
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def health_check(req):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)
