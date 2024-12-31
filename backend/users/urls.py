from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView
from .views import ProtectedView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # 新規登録エンドポイント
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # ログインエンドポイント
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # トークン更新エンドポイント

    path('protected/', ProtectedView.as_view(), name='protected'),  # 新しいエンドポイント
]
