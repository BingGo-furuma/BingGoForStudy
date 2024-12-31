from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'password']
        extra_kwargs = {'password': {'write_only': True}}


    def create(self, validated_data):
        try:
            user = CustomUser.objects.create(
                email=validated_data['email'],
                name=validated_data['name'],
            )
            user.set_password(validated_data['password'])
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Error creating user: {str(e)}")

    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email  # カスタムクレーム
        return token

    def validate(self, attrs):
        # Django の認証が内部で 'username' を使用するため 'email' をマッピング
        credentials = {
            'username': attrs.get('email', ''),
            'password': attrs.get('password',''),
        }

        # バリデーションチェック
        if not credentials['username'] or not credentials['password']:
            raise serializers.ValidationError("Both email and password are required.")

        # 親クラスのバリデーションを呼び出す
        return super().validate(credentials)
