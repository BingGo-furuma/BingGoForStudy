from __future__ import annotations

from itertools import islice

from django.core.management.base import BaseCommand
from django.db import transaction

from ...data.challenge_bank import build_japanese_questions, build_math_questions
from ...models import (
    Achievement,
    BingoCard,
    BingoTile,
    ChallengeQuestion,
    CoachingTip,
    DifficultyChoices,
    LearningResource,
    SubjectChoices,
)

CARD_DEFINITIONS = [
    {
        "slug": "math-foundation",
        "title": "数学基礎マスターカード",
        "summary": "中学範囲の計算力を徹底的に鍛える25マス。四則演算と分数変換を中心に構成。",
        "subject_focus": SubjectChoices.MATH,
        "difficulty": DifficultyChoices.BASIC,
        "grade_level": "中学1-2年",
        "reward_multiplier": 12,
    },
    {
        "slug": "math-advanced",
        "title": "高校数学ステップアップカード",
        "summary": "高校1年レベルの代数と図形を融合したチャレンジセット。",
        "subject_focus": SubjectChoices.MATH,
        "difficulty": DifficultyChoices.STANDARD,
        "grade_level": "高校1年",
        "reward_multiplier": 15,
    },
    {
        "slug": "japanese-vocabulary",
        "title": "国語語彙&漢字特訓カード",
        "summary": "頻出熟語と漢字の読みをテンポよく確認できる25問。",
        "subject_focus": SubjectChoices.JAPANESE,
        "difficulty": DifficultyChoices.STANDARD,
        "grade_level": "中学-高校",
        "reward_multiplier": 10,
    },
    {
        "slug": "japanese-reading",
        "title": "国語読解アドベンチャー",
        "summary": "読解・助詞・語彙をバランスよく配置した応用セット。",
        "subject_focus": SubjectChoices.JAPANESE,
        "difficulty": DifficultyChoices.ADVANCED,
        "grade_level": "高校1年",
        "reward_multiplier": 14,
    },
]

ACHIEVEMENTS = [
    {"code": "first-clear", "title": "初めてのマスクリア", "description": "ビンゴカードのマスを初めてクリアした", "points": 50},
    {"code": "ten-tiles", "title": "10マス突破", "description": "合計10マスをクリアした", "points": 120},
    {"code": "math-master", "title": "計算マスター", "description": "数学カードで15マスをクリアした", "points": 200, "subject": SubjectChoices.MATH},
    {"code": "japanese-ace", "title": "国語エース", "description": "国語カードで15マスをクリアした", "points": 200, "subject": SubjectChoices.JAPANESE},
    {"code": "bingo-hunter", "title": "ビンゴハンター", "description": "累計25マスをクリアした", "points": 250},
    {"code": "line-clear", "title": "ラインコンプリート", "description": "ビンゴラインを1列完成させた", "points": 150},
]

RESOURCES = [
    {
        "subject": SubjectChoices.MATH,
        "title": "NHK for School 数学I 入門",
        "description": "基礎的な二次関数の考え方を15分で解説する映像教材。",
        "url": "https://www.nhk.or.jp/kokokoza/",
        "resource_type": "video",
        "estimated_minutes": 15,
    },
    {
        "subject": SubjectChoices.MATH,
        "title": "東大CASTのYouTubeチャンネル",
        "description": "国公立二次試験レベルの整数問題を扱う無料講義。",
        "url": "https://www.youtube.com/@todai_cast",
        "resource_type": "video",
        "estimated_minutes": 25,
    },
    {
        "subject": SubjectChoices.JAPANESE,
        "title": "スタディサプリ古文文法まとめ",
        "description": "助動詞・敬語表現を整理できる無料公開記事。",
        "url": "https://studysapuri.jp/",
        "resource_type": "article",
        "estimated_minutes": 20,
    },
    {
        "subject": SubjectChoices.JAPANESE,
        "title": "NHKゴガク 読解力特集",
        "description": "ニュースを題材に要約と語彙を鍛えるオンライン教材。",
        "url": "https://www.nhk.or.jp/gogaku/",
        "resource_type": "article",
        "estimated_minutes": 18,
    },
]

COACHING_TIPS = [
    {
        "subject": SubjectChoices.MATH,
        "title": "計算スピード向上のコツ",
        "content": "毎日10分の暗算トレーニングを続け、必ず途中式をメモに残すことでケアレスミスを減らせます。",
    },
    {
        "subject": SubjectChoices.MATH,
        "title": "図形問題の描き方",
        "content": "定規を使わず手で図を描き、角度や長さに仮の値を置いて検証する習慣をつけましょう。",
    },
    {
        "subject": SubjectChoices.JAPANESE,
        "title": "現代文の根拠探し",
        "content": "設問文と本文を同じ言葉で紐づけるマーキングを行い、根拠のある選択肢を選ぶ練習を繰り返します。",
    },
    {
        "subject": SubjectChoices.JAPANESE,
        "title": "語彙暗記のルーティン",
        "content": "朝晩で同じ熟語を復習し、例文を声に出して読むことで定着が早まります。",
    },
]


class Command(BaseCommand):
    help = "BingGo学習アプリのサンプルデータを投入します。"

    @transaction.atomic
    def handle(self, *args, **options):
        math_payloads = build_math_questions()
        japanese_payloads = build_japanese_questions()
        self.stdout.write(self.style.NOTICE(f"数学問題: {len(math_payloads)}件、国語問題: {len(japanese_payloads)}件を登録します。"))

        for payload in math_payloads + japanese_payloads:
            ChallengeQuestion.objects.update_or_create(
                subject=payload["subject"],
                prompt=payload["prompt"],
                defaults={
                    "grade_level": payload["grade_level"],
                    "question_type": payload["question_type"],
                    "choices": payload["choices"],
                    "correct_choices": payload["correct_choices"],
                    "difficulty": payload["difficulty"],
                    "tags": payload["tags"],
                    "source": payload["source"],
                    "estimated_minutes": payload["estimated_minutes"],
                    "pass_threshold": payload["pass_threshold"],
                },
            )

        math_questions = list(ChallengeQuestion.objects.filter(subject=SubjectChoices.MATH).order_by("id"))
        japanese_questions = list(ChallengeQuestion.objects.filter(subject=SubjectChoices.JAPANESE).order_by("id"))

        question_iterators = {
            SubjectChoices.MATH: iter(math_questions),
            SubjectChoices.JAPANESE: iter(japanese_questions),
        }

        for card_def in CARD_DEFINITIONS:
            card, _ = BingoCard.objects.update_or_create(
                slug=card_def["slug"],
                defaults={
                    "title": card_def["title"],
                    "summary": card_def["summary"],
                    "subject_focus": card_def["subject_focus"],
                    "difficulty": card_def["difficulty"],
                    "grade_level": card_def["grade_level"],
                    "reward_multiplier": card_def["reward_multiplier"],
                },
            )

            questions = list(islice(question_iterators[card.subject_focus], card.size * card.size))
            if len(questions) < card.size * card.size:
                raise RuntimeError(f"{card.title} に割り当てる問題が不足しています。")

            for index, question in enumerate(questions, start=1):
                row = (index - 1) // card.size
                column = (index - 1) % card.size
                BingoTile.objects.update_or_create(
                    card=card,
                    position=index,
                    defaults={
                        "row": row,
                        "column": column,
                        "challenge": question,
                        "reward_points": card.reward_multiplier + (index % 5) * 2,
                        "recommended_minutes": max(5, question.estimated_minutes),
                    },
                )

        for achievement in ACHIEVEMENTS:
            Achievement.objects.update_or_create(
                code=achievement["code"],
                defaults={
                    "title": achievement["title"],
                    "description": achievement["description"],
                    "points": achievement["points"],
                    "subject": achievement.get("subject", ""),
                    "icon": achievement.get("icon", "⭐"),
                },
            )

        for resource in RESOURCES:
            LearningResource.objects.update_or_create(
                title=resource["title"],
                defaults={
                    "subject": resource["subject"],
                    "description": resource["description"],
                    "url": resource["url"],
                    "resource_type": resource["resource_type"],
                    "estimated_minutes": resource["estimated_minutes"],
                },
            )

        for tip in COACHING_TIPS:
            CoachingTip.objects.update_or_create(
                title=tip["title"],
                defaults={
                    "subject": tip["subject"],
                    "content": tip["content"],
                },
            )

        self.stdout.write(self.style.SUCCESS("サンプルデータの投入が完了しました。"))
