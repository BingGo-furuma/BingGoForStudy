from django.db import models
from backend.users.models import CustomUser  # CustomUserをインポート


class Bingo(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    card = models.JSONField(default=dict)  # ビンゴカードの状態（マスの内容やスタンプ状況）
    created_at = models.DateTimeField(auto_now_add=True)

class Mission(models.Model):
    bingo = models.ForeignKey(Bingo, on_delete=models.CASCADE)
    description = models.TextField()  # ミッションの内容
    completed = models.BooleanField(default=False)

# Create your models here.
