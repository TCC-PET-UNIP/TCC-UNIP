from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import OngSerializer, AdotanteSerializer, LoginSerializer, AccountOutputSerializer, ongUpdateImageSerializer, petUpdateImageSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Conta, Ong, Pets

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

@api_view(['POST'])
def update_ong_image(req):
    print(req.data)
    serializer = ongUpdateImageSerializer(data=req.data)
    serializer.is_valid(raise_exception=True)

    ong_id = serializer.validated_data['id']
    imagem = serializer.validated_data['imagem']

    try:
        ong = Ong.objects.get(id=ong_id)
    except Ong.DoesNotExist:
        return Response({"error": "ONG não encontrada"}, status=status.HTTP_404_NOT_FOUND)

    ong.imagem = imagem
    ong.save()

    return Response({"message": "Imagem da ONG atualizada com sucesso"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def update_pet_image(req):
    serializer = petUpdateImageSerializer(data=req.data)
    serializer.is_valid(raise_exception=True)

    pet_id = serializer.validated_data['id']
    imagem = serializer.validated_data['imagem']

    try:
        pet = Pets.objects.get(id=pet_id)
    except Pets.DoesNotExist:
        return Response({"error": "Pet não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    pet.imagem = imagem
    pet.save()

    return Response({"message": "Imagem do Pet atualizada com sucesso"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def health_check(req):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)
