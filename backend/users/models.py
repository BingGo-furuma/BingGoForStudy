from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=50)  # 名前フィールドを追加

    username = None  # username フィールドを無効化



    
    # 認証に email を使用
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    def __str__(self):
        return self.email


# Create your models here.
