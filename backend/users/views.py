from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
import logging

logger = logging.getLogger(__name__)

class RegisterView(APIView):  # クラス名を変更
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        logger.info(f"Login request data: {request.data}")
        return super().post(request, *args, **kwargs)


class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]  # 認証が必要

    def get(self, request):
        logger.info(f"ProtectedView accessed by user: {request.user}")
        return Response({"message": "This is a protected endpoint!"})
