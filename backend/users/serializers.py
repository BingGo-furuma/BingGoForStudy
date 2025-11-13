from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "password",
            "name",
            "grade",
            "avatar_color",
            "goal_schools",
            "payment_method",
            "subscription_plan",
            "subscription_status",
            "subscription_renewal",
            "study_schedule",
            "preferred_subjects",
            "guardian_contact",
            "notes",
            "points",
        ]
        read_only_fields = ("points",)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        if not user.subscription_status:
            user.subscription_status = "trial"
        if not user.subscription_plan:
            user.subscription_plan = "BingGo フリープラン"
        if not user.subscription_renewal:
            user.subscription_renewal = timezone.now().date()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["name"] = user.name
        return token

    def validate(self, attrs):
        credentials = {
            "username": attrs.get("email", ""),
            "password": attrs.get("password", ""),
        }
        if not credentials["username"] or not credentials["password"]:
            raise serializers.ValidationError("Both email and password are required.")
        return super().validate(credentials)
