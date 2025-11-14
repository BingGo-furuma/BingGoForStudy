from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
from typing import Iterable

from django.db.models import Count, Q
from django.utils import timezone

from .models import (
    Achievement,
    BingoCard,
    BingoTile,
    ChallengeAttempt,
    ChallengeQuestion,
    CoachingTip,
    DifficultyChoices,
    Notification,
    StudyPlanEntry,
    SubjectChoices,
    UserAchievement,
    UserTileProgress,
)


@dataclass
class ScoreResult:
    score: Decimal
    ratio: float
    is_passed: bool


def calculate_score(challenge: ChallengeQuestion, selected_choices: Iterable[str]) -> ScoreResult:
    selected = set(selected_choices)
    correct = set(challenge.correct_choices)

    if challenge.question_type in {"activity", "confirmation"}:
        ratio = 1.0 if selected else 0.0
        score = Decimal(str(round(ratio * 100, 2)))
        is_passed = bool(selected) or not correct
        return ScoreResult(score=score, ratio=ratio, is_passed=is_passed)

    if not correct:
        return ScoreResult(score=Decimal("0"), ratio=0.0, is_passed=False)

    correct_hits = len(selected & correct)
    penalty = len(selected - correct)
    ratio = max(0.0, (correct_hits - penalty) / len(correct))
    score = Decimal(str(round(ratio * 100, 2)))
    is_passed = ratio >= float(challenge.pass_threshold)
    return ScoreResult(score=score, ratio=ratio, is_passed=is_passed)


def update_tile_progress(user, tile: BingoTile, score: Decimal, is_passed: bool) -> UserTileProgress:
    progress, _ = UserTileProgress.objects.get_or_create(user=user, tile=tile)
    now = timezone.now()
    progress.attempts += 1
    if score > progress.best_score:
        progress.best_score = score
    progress.last_attempt_at = now
    if is_passed:
        progress.is_completed = True
        if not progress.completed_at:
            progress.completed_at = now
    progress.save()

    # 勉強計画に紐づく予定があれば完了に更新
    StudyPlanEntry.objects.filter(user=user, bingo_tile=tile, status__in=["scheduled", "in_progress"], scheduled_for__lte=date.today()).update(status="completed")

    return progress


def completed_lines(user, card: BingoCard) -> list[dict[str, object]]:
    size = card.size
    grid = [[False for _ in range(size)] for _ in range(size)]
    for progress in UserTileProgress.objects.filter(user=user, tile__card=card, is_completed=True).select_related("tile"):
        grid[progress.tile.row][progress.tile.column] = True

    lines: list[dict[str, object]] = []
    for row in range(size):
        if all(grid[row][col] for col in range(size)):
            lines.append({"type": "row", "index": row})
    for col in range(size):
        if all(grid[row][col] for row in range(size)):
            lines.append({"type": "column", "index": col})
    if all(grid[i][i] for i in range(size)):
        lines.append({"type": "diagonal", "index": 0})
    if all(grid[i][size - 1 - i] for i in range(size)):
        lines.append({"type": "diagonal", "index": 1})
    return lines


def _collect_stats(user) -> dict[str, object]:
    progress_records = list(
        UserTileProgress.objects.filter(user=user, is_completed=True).select_related("tile__challenge", "tile__card")
    )
    subject_counts = Counter()
    card_counts = Counter()
    for progress in progress_records:
        subject_counts[progress.tile.challenge.subject] += 1
        card_counts[progress.tile.card.slug] += 1
    return {
        "total_completed": len(progress_records),
        "subject_counts": subject_counts,
        "card_counts": card_counts,
    }


ACHIEVEMENT_RULES = (
    ("first-clear", lambda stats: stats["total_completed"] >= 1),
    ("ten-tiles", lambda stats: stats["total_completed"] >= 10),
    ("math-master", lambda stats: stats["subject_counts"].get("math", 0) >= 15),
    ("japanese-ace", lambda stats: stats["subject_counts"].get("japanese", 0) >= 15),
    ("bingo-hunter", lambda stats: stats["total_completed"] >= 25),
)


def award_achievements(user, card: BingoCard, new_lines: int) -> list[Achievement]:
    stats = _collect_stats(user)
    awarded: list[Achievement] = []
    for code, rule in ACHIEVEMENT_RULES:
        achievement = Achievement.objects.filter(code=code).first()
        if not achievement:
            continue
        if rule(stats):
            _, created = UserAchievement.objects.get_or_create(user=user, achievement=achievement)
            if created:
                awarded.append(achievement)
    if new_lines > 0:
        achievement = Achievement.objects.filter(code="line-clear").first()
        if achievement:
            _, created = UserAchievement.objects.get_or_create(user=user, achievement=achievement)
            if created:
                awarded.append(achievement)
    return awarded


def build_insight_summary(user) -> dict[str, object]:
    today = date.today()
    weekly_activity = []
    for offset in range(6, -1, -1):
        target_day = today - timedelta(days=offset)
        attempts = ChallengeAttempt.objects.filter(user=user, created_at__date=target_day).count()
        weekly_activity.append({"date": target_day.isoformat(), "attempts": attempts})

    subject_perf = []
    for subject, label in SubjectChoices.choices:
        attempts = ChallengeAttempt.objects.filter(user=user, challenge__subject=subject)
        total = attempts.count()
        passed = attempts.filter(is_passed=True).count()
        rate = round((passed / total) * 100, 1) if total else 0
        subject_perf.append({"subject": subject, "label": label, "rate": rate, "attempts": total})

    difficulty_perf = []
    for difficulty, label in DifficultyChoices.choices:
        attempts = ChallengeAttempt.objects.filter(user=user, challenge__difficulty=difficulty)
        total = attempts.count()
        passed = attempts.filter(is_passed=True).count()
        rate = round((passed / total) * 100, 1) if total else 0
        difficulty_perf.append({"difficulty": difficulty, "label": label, "rate": rate, "attempts": total})

    recent_attempts = [
        {
            "id": attempt.id,
            "challenge": attempt.challenge.prompt,
            "card": attempt.tile.card.title,
            "score": float(attempt.score),
            "passed": attempt.is_passed,
            "created_at": attempt.created_at.isoformat(),
        }
        for attempt in ChallengeAttempt.objects.filter(user=user)
        .select_related("challenge", "tile__card")
        .order_by("-created_at")[:8]
    ]

    # 月別のライン達成数
    monthly_bingo = []
    for offset in range(5, -1, -1):
        month_start = (today.replace(day=1) - timedelta(days=offset * 30)).replace(day=1)
        next_month = (month_start + timedelta(days=32)).replace(day=1)
        count = (
            UserTileProgress.objects.filter(user=user, is_completed=True, completed_at__date__gte=month_start, completed_at__date__lt=next_month)
            .values("tile__card")
            .annotate(total=Count("id"))
            .count()
        )
        monthly_bingo.append({"month": month_start.strftime("%Y-%m"), "lines": count})

    tips = list(
        CoachingTip.objects.filter(subject__in=["math", "japanese"]).values("id", "subject", "title", "content")[:5]
    )

    return {
        "weekly_activity": weekly_activity,
        "subject_performance": subject_perf,
        "difficulty_breakdown": difficulty_perf,
        "recent_challenges": recent_attempts,
        "monthly_bingo": monthly_bingo,
        "coaching_tips": tips,
    }


def queue_notification(user, title: str, message: str, category: str = "challenge") -> Notification:
    return Notification.objects.create(user=user, title=title, message=message, category=category)
