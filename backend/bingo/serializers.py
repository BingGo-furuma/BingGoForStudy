from __future__ import annotations

from typing import Any

from rest_framework import serializers

from .models import (
    Achievement,
    BingoCard,
    BingoTile,
    ChallengeAttempt,
    ChallengeQuestion,
    CoachingTip,
    LearningResource,
    Notification,
    StudyPlanEntry,
    UserAchievement,
    UserTileProgress,
)


class ChallengeOptionSerializer(serializers.Serializer):
    key = serializers.CharField()
    text = serializers.CharField()


class ChallengeQuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeQuestion
        fields = (
            "id",
            "subject",
            "grade_level",
            "prompt",
            "question_type",
            "options",
            "difficulty",
            "tags",
            "source",
            "estimated_minutes",
            "pass_threshold",
            "explanation",
        )

    def get_options(self, obj: ChallengeQuestion) -> list[dict[str, Any]]:
        return obj.choices


class TileProgressSerializer(serializers.Serializer):
    attempts = serializers.IntegerField()
    best_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    is_completed = serializers.BooleanField()
    last_attempt_at = serializers.DateTimeField(allow_null=True)
    completed_at = serializers.DateTimeField(allow_null=True)


class BingoTileSerializer(serializers.ModelSerializer):
    challenge = ChallengeQuestionSerializer()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = BingoTile
        fields = (
            "id",
            "position",
            "row",
            "column",
            "reward_points",
            "recommended_minutes",
            "challenge",
            "progress",
        )

    def get_progress(self, obj: BingoTile) -> dict[str, Any] | None:
        user = self.context.get("request").user if self.context.get("request") else None
        if user and user.is_authenticated:
            try:
                progress = obj.progress_records.get(user=user)
                return TileProgressSerializer(progress).data
            except UserTileProgress.DoesNotExist:
                return None
        return None


class BingoCardSummarySerializer(serializers.ModelSerializer):
    total_tiles = serializers.SerializerMethodField()
    completed_tiles = serializers.SerializerMethodField()
    points_earned = serializers.SerializerMethodField()
    completed_lines = serializers.SerializerMethodField()

    class Meta:
        model = BingoCard
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "subject_focus",
            "difficulty",
            "grade_level",
            "size",
            "tags",
            "created_at",
            "updated_at",
            "total_tiles",
            "completed_tiles",
            "points_earned",
            "completed_lines",
        )

    def _user_progress(self, obj: BingoCard) -> list[UserTileProgress]:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return []
        return list(
            UserTileProgress.objects.filter(user=request.user, tile__card=obj).select_related("tile")
        )

    def get_total_tiles(self, obj: BingoCard) -> int:
        return obj.tiles.count()

    def get_completed_tiles(self, obj: BingoCard) -> int:
        progresses = [p for p in self._user_progress(obj) if p.is_completed]
        return len(progresses)

    def get_points_earned(self, obj: BingoCard) -> int:
        progresses = [p for p in self._user_progress(obj) if p.is_completed]
        return sum(p.tile.reward_points for p in progresses)

    def get_completed_lines(self, obj: BingoCard) -> list[dict[str, object]]:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return []
        from .services import completed_lines  # inline import to avoid circular dependency

        return completed_lines(request.user, obj)


class BingoCardDetailSerializer(BingoCardSummarySerializer):
    tiles = BingoTileSerializer(many=True)

    class Meta(BingoCardSummarySerializer.Meta):
        fields = BingoCardSummarySerializer.Meta.fields + ("tiles",)


class StudyPlanEntrySerializer(serializers.ModelSerializer):
    tile = BingoTileSerializer(source="bingo_tile", read_only=True)

    class Meta:
        model = StudyPlanEntry
        fields = (
            "id",
            "subject",
            "title",
            "description",
            "scheduled_for",
            "start_time",
            "duration_minutes",
            "status",
            "plan_type",
            "location",
            "coach_note",
            "bingo_tile",
            "tile",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "title", "message", "category", "created_at", "read_at")
        read_only_fields = ("created_at", "read_at")


class LearningResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningResource
        fields = (
            "id",
            "subject",
            "title",
            "description",
            "url",
            "resource_type",
            "estimated_minutes",
        )


class ChallengeAttemptSerializer(serializers.ModelSerializer):
    challenge = ChallengeQuestionSerializer(read_only=True)

    class Meta:
        model = ChallengeAttempt
        fields = ("id", "challenge", "submitted_choices", "score", "is_passed", "created_at")


class AchievementSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    earned_at = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = ("id", "code", "title", "description", "points", "subject", "icon", "is_unlocked", "earned_at")

    def get_is_unlocked(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.awarded_to.filter(user=request.user).exists()

    def get_earned_at(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return None
        record = obj.awarded_to.filter(user=request.user).first()
        return record.earned_at if record else None


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ("id", "achievement", "earned_at")


class CoachingTipSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachingTip
        fields = ("id", "subject", "title", "content", "created_at")


class SubmitChallengeSerializer(serializers.Serializer):
    tile_id = serializers.IntegerField()
    selected_choices = serializers.ListField(child=serializers.CharField())

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        tile_id = attrs.get("tile_id")
        try:
            tile = BingoTile.objects.select_related("challenge", "card").get(id=tile_id)
        except BingoTile.DoesNotExist as exc:  # pragma: no cover - guard for invalid user input
            raise serializers.ValidationError({"tile_id": "指定したマスが見つかりません。"}) from exc

        attrs["tile"] = tile
        attrs["challenge"] = tile.challenge
        return attrs
