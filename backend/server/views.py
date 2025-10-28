from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import status
from .serializers import OngSerializer, AdotanteSerializer, LoginSerializer, AccountOutputSerializer, OngUpdateSerializer, AdopterUpdateSerializer, PetUpdateSerializer, PetSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Conta, Ong, Pets, Adotante
from .AI.compatibility_model import CompatibilityModel, predict_and_rank_pets, ADOPTER_FEATURES, PET_FEATURES
import torch, os
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
MODEL_PATH = APP_DIR / "AI" / "compatibility_model_final_weights.pth"

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

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def register_pet(req):
    data = dict(req.data)

    if not data.get('vetor_caracteristicas'):
        data['vetor_caracteristicas'] = [1,5,0,0,1,1,1]

    for key, value in data.items():
        # Exemplo: {'nome': ['Rex']} -> 'Rex'
        if isinstance(value, list) and len(value) == 1:
            data[key] = value[0]

    serializer = PetSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
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
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_pets(req):
    ong_id = req.data.get('ong_id')
    if not ong_id:
        return Response({'error': 'Campo "ong_id" é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        pets = Pets.objects.filter(ong_id=ong_id)
        serialized = PetSerializer(pets, many=True, context={'request': req})
        return Response({'ong_id': ong_id, 'total_pets': len(pets), 'pets': serialized.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_pet_by_id(req):
    pet_id = req.data.get('pet_id')
    if not pet_id:
        return Response({'error': 'Campo "pet_id" é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        pet = Pets.objects.get(id=pet_id)
        serialized = PetSerializer(pet, context={'request': req})
        return Response({'pet_id': pet_id, 'pet': serialized.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_pet(req):
    pet_id = req.data.get('pet_id')
    if not pet_id:
        return Response({'error': 'Campo "pet_id" é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        pet = Pets.objects.get(id=pet_id)
        pet.delete()
        return Response({'message': 'Pet deletado com sucesso.'}, status=status.HTTP_200_OK)
    except Pets.DoesNotExist:
        return Response({'error': 'Pet não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def login(req):
    serializer = LoginSerializer(data=req.data)
    serializer.is_valid(raise_exception=True) # Retorna 400 automaticamente se algum dos campos for inválido

    email = serializer.validated_data['email']
    senha = serializer.validated_data['password']

    user = authenticate(email=email, password=senha)

    if user is None:
        return Response({"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

    # Gera o token JWT
    JWT_token = RefreshToken.for_user(user)

    return Response({
        'user': AccountOutputSerializer(user).data,
        'refresh': str(JWT_token),
        'access': str(JWT_token.access_token)
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_compatible_pets(req):
    try:
        adotante_id = req.data.get('adotante_id')
        if not adotante_id:
            return Response({'error': 'Campo "adotante_id" é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        adotante = Adotante.objects.get(id=adotante_id)

        adopter_vector = adotante.vetor_caracteristicas

        pets = Pets.objects.filter(disponivel=True)
        pets_vectors = [pet.vetor_caracteristicas for pet in pets]
        print(pets_vectors) # PRINT AQUI

        model = CompatibilityModel(ADOPTER_FEATURES, PET_FEATURES)
        if os.path.exists(MODEL_PATH):
            model.load_state_dict(torch.load(MODEL_PATH))
        else:
            return Response({'error': 'Modelo de compatibilidade não encontrado.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        results = predict_and_rank_pets(model, adopter_vector, pets_vectors)
        ranked_safe_pets = results.get('ranked_safe_pets', [])

        safe_pet_ids = []
        for pet_result in ranked_safe_pets:
            index = pet_result['pet_id'] - 1
            if 0 <= index < len(pets):
                safe_pet_ids.append(pets[index].id)
        ranked_pets = Pets.objects.filter(id__in=safe_pet_ids)
        serialized = PetSerializer(ranked_pets, many=True)

        return Response({'adotante_id': adotante_id, 'total_pets_compatíveis': len(safe_pet_ids), 'pets': serialized.data}, status=status.HTTP_200_OK)

    except Adotante.DoesNotExist:
        return Response({'error': 'Adotante não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def health_check(req):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)
