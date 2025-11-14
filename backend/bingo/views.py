from __future__ import annotations

from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Achievement,
    BingoCard,
    BingoTile,
    CardProgramType,
    ChallengeAttempt,
    CoachingTip,
    LearningResource,
    Notification,
    StudyPlanEntry,
)
from .serializers import (
    AchievementSerializer,
    BingoCardDetailSerializer,
    BingoCardSummarySerializer,
    BingoTileSerializer,
    ChallengeAttemptSerializer,
    CoachingTipSerializer,
    LearningResourceSerializer,
    NotificationSerializer,
    StudyPlanEntrySerializer,
    SubmitChallengeSerializer,
    TileProgressSerializer,
)
from .services import (
    award_achievements,
    build_insight_summary,
    calculate_score,
    completed_lines,
    queue_notification,
    update_tile_progress,
)


class BingoCardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BingoCard.objects.all()
    serializer_class = BingoCardSummarySerializer
    pagination_class = None
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        tiles = BingoTile.objects.select_related("challenge").order_by("position")
        queryset = (
            BingoCard.objects.all()
            .prefetch_related(Prefetch("tiles", queryset=tiles))
            .order_by("title")
        )
        program = self.request.query_params.get("program")
        if program in CardProgramType.values:
            queryset = queryset.filter(program_type=program)
        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BingoCardDetailSerializer
        return super().get_serializer_class()

    @action(detail=True, methods=["post"], url_path=r"tiles/(?P<tile_id>\d+)/submit")
    def submit(self, request, pk=None, tile_id=None):
        card = self.get_object()
        payload = {
            "tile_id": tile_id,
            "selected_choices": request.data.get("selected_choices", []),
        }
        serializer = SubmitChallengeSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        tile = serializer.validated_data["tile"]
        challenge = serializer.validated_data["challenge"]
        selected_choices = serializer.validated_data["selected_choices"]

        if tile.card_id != card.id:
            return Response({"detail": "カードとマスの組み合わせが不正です。"}, status=status.HTTP_400_BAD_REQUEST)

        before_lines = completed_lines(request.user, card)
        score_result = calculate_score(challenge, selected_choices)

        attempt = ChallengeAttempt.objects.create(
            user=request.user,
            challenge=challenge,
            tile=tile,
            submitted_choices=selected_choices,
            score=score_result.score,
            is_passed=score_result.is_passed,
        )

        progress = update_tile_progress(request.user, tile, score_result.score, score_result.is_passed)
        after_lines = completed_lines(request.user, card)
        new_lines = max(0, len(after_lines) - len(before_lines))
        awarded = award_achievements(request.user, card, new_lines)

        points_awarded = tile.reward_points if score_result.is_passed else 0
        if points_awarded:
            if card.program_type == CardProgramType.BINGGO:
                request.user.binggo_points = request.user.binggo_points + points_awarded
                update_fields = ["binggo_points"]
                notice_title = "Bing Go チャレンジ達成！"
            else:
                request.user.points = request.user.points + points_awarded
                update_fields = ["points"]
                notice_title = "マスをクリアしました！"
            request.user.save(update_fields=update_fields)
            queue_notification(
                request.user,
                title=notice_title,
                message=f"{card.title} のマス {tile.position} を達成し、{points_awarded} ポイントを獲得しました。",
            )

        return Response(
            {
                "attempt": ChallengeAttemptSerializer(attempt, context={"request": request}).data,
                "progress": TileProgressSerializer(progress).data,
                "result": {
                    "score": float(score_result.score),
                    "ratio": score_result.ratio,
                    "is_passed": score_result.is_passed,
                    "correct_choices": challenge.correct_choices,
                    "explanation": challenge.explanation,
                    "awarded_points": points_awarded,
                    "awarded_achievements": AchievementSerializer(
                        awarded, many=True, context={"request": request}
                    ).data,
                    "completed_lines": after_lines,
                    "new_lines": new_lines,
                },
            },
            status=status.HTTP_200_OK,
        )


class StudyPlanViewSet(viewsets.ModelViewSet):
    serializer_class = StudyPlanEntrySerializer
    pagination_class = None

    def get_queryset(self):
        return StudyPlanEntry.objects.filter(user=self.request.user).select_related("bingo_tile__challenge", "bingo_tile__card")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = NotificationSerializer
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.read_at = timezone.now()
        instance.save(update_fields=["read_at"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class LearningResourceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LearningResourceSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = LearningResource.objects.all().order_by("subject", "title")
        subject = self.request.query_params.get("subject")
        if subject:
            queryset = queryset.filter(subject=subject)
        return queryset


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer
    pagination_class = None

    def get_queryset(self):
        return Achievement.objects.all().order_by("points")


class ChallengeAttemptViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = ChallengeAttemptSerializer
    pagination_class = None

    def get_queryset(self):
        return ChallengeAttempt.objects.filter(user=self.request.user).select_related("challenge", "tile__card")


class CoachingTipView(APIView):
    def get(self, request, *args, **kwargs):
        tips = CoachingTip.objects.all().order_by("-created_at")[:10]
        serializer = CoachingTipSerializer(tips, many=True)
        return Response(serializer.data)


class InsightSummaryView(APIView):
    def get(self, request, *args, **kwargs):
        data = build_insight_summary(request.user)
        return Response(data)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response({"status": "ok"})
