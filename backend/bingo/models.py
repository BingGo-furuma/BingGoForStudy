from __future__ import annotations

from datetime import date, time

from django.conf import settings
from django.db import models


class SubjectChoices(models.TextChoices):
    MATH = "math", "算数"
    JAPANESE = "japanese", "国語"
    ENGLISH = "english", "英語"
    SCIENCE = "science", "理科"
    SOCIAL = "social", "社会"


class DifficultyChoices(models.TextChoices):
    BASIC = "basic", "基礎"
    STANDARD = "standard", "標準"
    ADVANCED = "advanced", "応用"


class ChallengeQuestion(models.Model):
    subject = models.CharField(max_length=32, choices=SubjectChoices.choices)
    grade_level = models.CharField(max_length=32)
    prompt = models.TextField()
    question_type = models.CharField(max_length=32, default="multiple_choice")
    choices = models.JSONField(default=list, help_text="一覧形式の選択肢")
    correct_choices = models.JSONField(default=list, help_text="正答のchoiceキー")
    explanation = models.TextField(blank=True)
    difficulty = models.CharField(max_length=32, choices=DifficultyChoices.choices)
    tags = models.JSONField(default=list, blank=True)
    source = models.CharField(max_length=128, blank=True)
    estimated_minutes = models.PositiveIntegerField(default=8)
    pass_threshold = models.DecimalField(max_digits=4, decimal_places=2, default=0.75)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["subject", "grade_level", "id"]

    def __str__(self) -> str:
        return f"{self.get_subject_display()} / {self.prompt[:24]}"


class CardProgramType(models.TextChoices):
    FOR_STUDY = "study", "BingGo for Study"
    BINGGO = "binggo", "Bing Go"


class BingoCard(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    summary = models.TextField()
    subject_focus = models.CharField(max_length=32, choices=SubjectChoices.choices)
    difficulty = models.CharField(max_length=32, choices=DifficultyChoices.choices)
    grade_level = models.CharField(max_length=32)
    size = models.PositiveSmallIntegerField(default=5)
    reward_multiplier = models.PositiveSmallIntegerField(default=10)
    tags = models.JSONField(default=list, blank=True)
    program_type = models.CharField(
        max_length=32,
        choices=CardProgramType.choices,
        default=CardProgramType.FOR_STUDY,
    )
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    monthly_label = models.CharField(max_length=64, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self) -> str:
        return self.title

    @property
    def is_active(self) -> bool:
        today = date.today()
        if self.period_start and today < self.period_start:
            return False
        if self.period_end and today > self.period_end:
            return False
        return True


class BingoTile(models.Model):
    card = models.ForeignKey(BingoCard, related_name="tiles", on_delete=models.CASCADE)
    position = models.PositiveSmallIntegerField(help_text="1 から size^2 までのインデックス")
    row = models.PositiveSmallIntegerField()
    column = models.PositiveSmallIntegerField()
    challenge = models.ForeignKey(ChallengeQuestion, related_name="tiles", on_delete=models.PROTECT)
    reward_points = models.PositiveIntegerField(default=10)
    recommended_minutes = models.PositiveIntegerField(default=12)

    class Meta:
        unique_together = ("card", "position")
        ordering = ["card", "position"]

    def __str__(self) -> str:
        return f"{self.card.title} / {self.position}"


class ChallengeAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="challenge_attempts", on_delete=models.CASCADE)
    challenge = models.ForeignKey(ChallengeQuestion, related_name="attempts", on_delete=models.CASCADE)
    tile = models.ForeignKey(BingoTile, related_name="attempts", on_delete=models.CASCADE)
    submitted_choices = models.JSONField(default=list)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    is_passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class UserTileProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="tile_progress", on_delete=models.CASCADE)
    tile = models.ForeignKey(BingoTile, related_name="progress_records", on_delete=models.CASCADE)
    attempts = models.PositiveIntegerField(default=0)
    best_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_completed = models.BooleanField(default=False)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "tile")
        ordering = ["tile__position"]


class StudyPlanEntry(models.Model):
    STATUS_CHOICES = (
        ("scheduled", "予定"),
        ("in_progress", "実施中"),
        ("completed", "完了"),
        ("skipped", "スキップ"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="study_plan", on_delete=models.CASCADE)
    subject = models.CharField(max_length=32, choices=SubjectChoices.choices)
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    scheduled_for = models.DateField()
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="scheduled")
    bingo_tile = models.ForeignKey(BingoTile, null=True, blank=True, on_delete=models.SET_NULL)
    start_time = models.TimeField(default=time(19, 0))
    plan_type = models.CharField(max_length=32, default="self-study")
    location = models.CharField(max_length=128, blank=True)
    coach_note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_for", "subject"]


class Achievement(models.Model):
    code = models.SlugField(unique=True)
    title = models.CharField(max_length=120)
    description = models.TextField()
    points = models.PositiveIntegerField(default=50)
    subject = models.CharField(max_length=32, choices=SubjectChoices.choices, blank=True)
    icon = models.CharField(max_length=32, blank=True)

    def __str__(self) -> str:
        return self.title


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="earned_achievements", on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, related_name="awarded_to", on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "achievement")
        ordering = ["-earned_at"]


class Notification(models.Model):
    CATEGORY_CHOICES = (
        ("challenge", "チャレンジ"),
        ("plan", "学習計画"),
        ("system", "システム"),
        ("coaching", "コーチング"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="notifications", on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    message = models.TextField()
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]


class LearningResource(models.Model):
    RESOURCE_TYPES = (
        ("video", "動画"),
        ("article", "記事"),
        ("worksheet", "ワーク"),
        ("podcast", "音声"),
    )

    subject = models.CharField(max_length=32, choices=SubjectChoices.choices)
    title = models.CharField(max_length=160)
    url = models.URLField()
    description = models.TextField()
    resource_type = models.CharField(max_length=32, choices=RESOURCE_TYPES)
    estimated_minutes = models.PositiveIntegerField(default=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["subject", "title"]


class CoachingTip(models.Model):
    subject = models.CharField(max_length=32, choices=SubjectChoices.choices)
    title = models.CharField(max_length=120)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class InsightSnapshot(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="insight_snapshots", on_delete=models.CASCADE)
    label = models.CharField(max_length=64)
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
