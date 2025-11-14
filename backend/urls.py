from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from backend.bingo.views import (
    AchievementViewSet,
    BingoCardViewSet,
    ChallengeAttemptViewSet,
    CoachingTipView,
    HealthCheckView,
    InsightSummaryView,
    LearningResourceViewSet,
    NotificationViewSet,
    StudyPlanViewSet,
)

router = routers.DefaultRouter()
router.register(r"bingo/cards", BingoCardViewSet, basename="bingo-card")
router.register(r"study-plan", StudyPlanViewSet, basename="study-plan")
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"resources", LearningResourceViewSet, basename="resource")
router.register(r"achievements", AchievementViewSet, basename="achievement")
router.register(r"attempts", ChallengeAttemptViewSet, basename="attempt")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/bingo/insights/", InsightSummaryView.as_view(), name="insights"),
    path("api/bingo/coaching/", CoachingTipView.as_view(), name="coaching-tips"),
    path("api/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/users/", include("backend.users.urls")),
]
