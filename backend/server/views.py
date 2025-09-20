from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import OngSerializer
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def register_ong(req):
    serializer = OngSerializer(data=req.data)
    serializer.is_valid(raise_exception=True) # Retorna 400 automaticamente se algum dos campos for inválido
    ong = serializer.save()

    JWT_token = RefreshToken.for_user(serializer._created_account)
    
    return Response({
        'refresh': str(JWT_token),
        'access': str(JWT_token.access_token)
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def health_check(req):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)
