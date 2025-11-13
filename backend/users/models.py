from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=50)
    grade = models.CharField(max_length=32, blank=True)
    avatar_color = models.CharField(max_length=16, default="#2563eb")
    goal_schools = models.JSONField(default=list, blank=True)
    payment_method = models.CharField(max_length=128, blank=True)
    subscription_plan = models.CharField(max_length=64, blank=True)
    subscription_status = models.CharField(max_length=32, blank=True)
    subscription_renewal = models.DateField(null=True, blank=True)
    study_schedule = models.CharField(max_length=128, blank=True)
    preferred_subjects = models.JSONField(default=list, blank=True)
    guardian_contact = models.CharField(max_length=128, blank=True)
    notes = models.TextField(blank=True)
    points = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self) -> str:
        return self.email
