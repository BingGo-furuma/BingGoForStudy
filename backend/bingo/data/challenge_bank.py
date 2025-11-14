from __future__ import annotations

from itertools import cycle, islice
from typing import Iterable, List, Tuple

from ..models import DifficultyChoices, SubjectChoices


def _build_options(correct: str, distractors: Iterable[str], index: int) -> tuple[list[dict[str, str]], list[str]]:
    base_labels = ["A", "B", "C", "D"]
    candidates = [correct, *list(islice(distractors, 3))]
    shift = index % len(candidates)
    rotated = candidates[shift:] + candidates[:shift]
    options: list[dict[str, str]] = []
    correct_keys: list[str] = []
    for idx, text in enumerate(rotated):
        key = base_labels[idx]
        options.append({"key": key, "text": text})
        if text == correct:
            correct_keys.append(key)
    return options, correct_keys


def build_math_questions() -> list[dict]:
    questions: list[dict] = []
    counter = 0

    for a in range(2, 15):
        for b in range(2, 15):
            answer = a + b
            distractors = [str(answer - 1), str(answer + 2), str(answer + 4)]
            options, correct = _build_options(str(answer), distractors, counter)
            questions.append(
                {
                    "subject": SubjectChoices.MATH,
                    "grade_level": "中学1年",
                    "prompt": f"{a} + {b} = ?",
                    "question_type": "multiple_choice",
                    "choices": options,
                    "correct_choices": correct,
                    "difficulty": DifficultyChoices.BASIC,
                    "tags": ["四則演算", "加法"],
                    "source": "generated:addition",
                    "estimated_minutes": 4,
                    "pass_threshold": 0.75,
                }
            )
            counter += 1

    for a in range(50, 110, 5):
        for b in range(5, 35, 5):
            answer = a - b
            distractors = [str(answer + 5), str(answer - 5), str(answer + 10)]
            options, correct = _build_options(str(answer), distractors, counter)
            questions.append(
                {
                    "subject": SubjectChoices.MATH,
                    "grade_level": "中学2年",
                    "prompt": f"{a} - {b} = ?",
                    "question_type": "multiple_choice",
                    "choices": options,
                    "correct_choices": correct,
                    "difficulty": DifficultyChoices.BASIC,
                    "tags": ["四則演算", "減法"],
                    "source": "generated:subtraction",
                    "estimated_minutes": 5,
                    "pass_threshold": 0.75,
                }
            )
            counter += 1

    for a in range(3, 13):
        for b in range(2, 10):
            answer = a * b
            distractors = [str(answer - a), str(answer + b), str(answer + a)]
            options, correct = _build_options(str(answer), distractors, counter)
            questions.append(
                {
                    "subject": SubjectChoices.MATH,
                    "grade_level": "中学2年",
                    "prompt": f"{a} × {b} = ?",
                    "question_type": "multiple_choice",
                    "choices": options,
                    "correct_choices": correct,
                    "difficulty": DifficultyChoices.BASIC,
                    "tags": ["四則演算", "乗法"],
                    "source": "generated:multiplication",
                    "estimated_minutes": 5,
                    "pass_threshold": 0.75,
                }
            )
            counter += 1

    for numerator in range(1, 9):
        for denominator in range(2, 10):
            value = numerator / denominator
            prompt = f"{numerator}/{denominator} を小数で表すと？ (小数第2位まで)"
            answer = f"{value:.2f}"
            distractors = [f"{value + 0.1:.2f}", f"{value - 0.1:.2f}", f"{value + 0.2:.2f}"]
            options, correct = _build_options(answer, distractors, counter)
            questions.append(
                {
                    "subject": SubjectChoices.MATH,
                    "grade_level": "中学3年",
                    "prompt": prompt,
                    "question_type": "multiple_choice",
                    "choices": options,
                    "correct_choices": correct,
                    "difficulty": DifficultyChoices.STANDARD,
                    "tags": ["分数", "小数変換"],
                    "source": "generated:fraction",
                    "estimated_minutes": 6,
                    "pass_threshold": 0.8,
                }
            )
            counter += 1

    linear_coefficients = [(2, 3), (3, 5), (4, 7), (5, 9), (7, 11), (9, 13)]
    constants = [4, 6, 8, 10, 12, 14]
    for (a, b), c in zip(linear_coefficients, cycle(constants)):
        prompt = f"一次方程式 {a}x + {b} = {c + a * 3} の解 x を求めよ"
        solution = (c + a * 3 - b) / a
        distractors = [f"{solution + 1:.1f}", f"{solution - 1:.1f}", f"{solution + 2:.1f}"]
        options, correct = _build_options(f"{solution:.1f}", distractors, counter)
        questions.append(
            {
                "subject": SubjectChoices.MATH,
                "grade_level": "高校1年",
                "prompt": prompt,
                "question_type": "multiple_choice",
                "choices": options,
                "correct_choices": correct,
                "difficulty": DifficultyChoices.STANDARD,
                "tags": ["一次方程式", "代数"],
                "source": "generated:linear-equation",
                "estimated_minutes": 8,
                "pass_threshold": 0.8,
            }
        )
        counter += 1

    geometry_lengths = [(3, 4), (5, 12), (6, 8), (7, 24), (8, 15)]
    for base, height in geometry_lengths:
        area = base * height / 2
        prompt = f"底辺 {base} cm、高さ {height} cm の三角形の面積は？"
        distractors = [f"{area + 3:.1f}", f"{area - 2:.1f}", f"{area + 5:.1f}"]
        options, correct = _build_options(f"{area:.1f}", distractors, counter)
        questions.append(
            {
                "subject": SubjectChoices.MATH,
                "grade_level": "高校1年",
                "prompt": prompt,
                "question_type": "multiple_choice",
                "choices": options,
                "correct_choices": correct,
                "difficulty": DifficultyChoices.STANDARD,
                "tags": ["図形", "面積"],
                "source": "generated:geometry",
                "estimated_minutes": 7,
                "pass_threshold": 0.8,
            }
        )
        counter += 1

    return questions


IDIOM_MEANINGS = {
    "一石二鳥": "一度で二つの利益を得ること",
    "以心伝心": "言葉を使わなくても互いの心が通じ合うこと",
    "千差万別": "さまざまに違っていること",
    "七転八起": "何度失敗しても立ち上がること",
    "一期一会": "一生に一度限りの出会い",
    "異口同音": "多くの人が同じことを言うこと",
    "右往左往": "あわてふためいて混乱すること",
    "公明正大": "私心がなく公平で正しいこと",
    "臥薪嘗胆": "目的達成のために苦労に耐えること",
    "質実剛健": "飾り気がなくまじめで強いこと",
    "温故知新": "昔のことを学んで新しい知識を得ること",
    "大胆不敵": "度胸がすわっていて少しも恐れないこと",
    "馬耳東風": "人の意見を気に留めないこと",
    "本末転倒": "重要なこととつまらないことを取り違えること",
    "画竜点睛": "物事を完成させる仕上げ",
    "晴耕雨読": "晴れた日は畑を耕し雨の日は読書にいそしむ生活",
    "無病息災": "病気をせず健康であること",
    "質疑応答": "質問とそれへの答え",
    "栄枯盛衰": "栄えることと衰えることがかわるがわる起こること",
    "勇往邁進": "恐れず前に進むこと",
    "臨機応変": "状況に応じて適切に対応すること",
}


KANJI_READINGS = [
    ("傍観", "ぼうかん"),
    ("希求", "ききゅう"),
    ("詠嘆", "えいたん"),
    ("謙虚", "けんきょ"),
    ("焦燥", "しょうそう"),
    ("傲慢", "ごうまん"),
    ("栽培", "さいばい"),
    ("憂慮", "ゆうりょ"),
    ("淘汰", "とうた"),
    ("妥当", "だとう"),
    ("遵守", "じゅんしゅ"),
    ("衷心", "ちゅうしん"),
    ("蒐集", "しゅうしゅう"),
    ("諮問", "しもん"),
    ("希薄", "きはく"),
    ("饒舌", "じょうぜつ"),
    ("閑静", "かんせい"),
    ("駆逐", "くちく"),
    ("精緻", "せいち"),
    ("憧憬", "しょうけい"),
    ("端緒", "たんしょ"),
    ("稚拙", "ちせつ"),
    ("詭弁", "きべん"),
    ("醍醐味", "だいごみ"),
    ("洞察", "どうさつ"),
]


READING_PASSAGES: List[Tuple[str, str, List[str], str]] = [
    (
        "作者は早朝の海辺を歩き、波の音と潮の香りに包まれて心が落ち着いていく様子を描いている。",
        "筆者の心情として最も適切なのはどれか。",
        ["期待で胸が高鳴っている", "不安で落ち着かない", "静けさに癒やされている"],
        "静けさに癒やされている",
    ),
    (
        "古い町並みを歩きながら、主人公は祖母と過ごした幼少期の記憶を思い出し、優しい気持ちになっている。",
        "主人公の心情として適切なのはどれか。",
        ["祖母への恨みを抱いている", "懐かしさと温かさを感じている", "未来への不安を募らせている"],
        "懐かしさと温かさを感じている",
    ),
    (
        "美術館で印象的な絵画を見た瞬間、主人公は自分の進路に迷いがなくなったと感じた。",
        "主人公の心の変化として最も適切なのはどれか。",
        ["自信を失っている", "方向性を定めた", "怒りを覚えている"],
        "方向性を定めた",
    ),
    (
        "大雨の中で友人が傘を差し出してくれた場面を語り手は忘れられず、感謝の気持ちを噛みしめている。",
        "語り手の心情として最も適切なのはどれか。",
        ["友人を疑っている", "恩を感じている", "冷淡さに失望している"],
        "恩を感じている",
    ),
    (
        "山頂で広がる景色を目にした主人公は、これまでの努力が報われたと実感している。",
        "主人公の心情として適切なのはどれか。",
        ["敗北感に包まれている", "達成感を味わっている", "恐怖で足がすくんでいる"],
        "達成感を味わっている",
    ),
]


PARTICLE_QUESTIONS = [
    (
        "父__買ってくれた本を大切に読む。",
        ["が", "に", "を"],
        "が",
    ),
    (
        "雨__降ったので、試合は延期になった。",
        ["で", "が", "に"],
        "が",
    ),
    (
        "友達__相談して決めた計画だ。",
        ["と", "に", "から"],
        "と",
    ),
    (
        "教室__掃除してから帰りましょう。",
        ["を", "で", "に"],
        "を",
    ),
    (
        "図書館__静かに本を読みます。",
        ["で", "に", "を"],
        "で",
    ),
]


def build_japanese_questions() -> list[dict]:
    questions: list[dict] = []
    counter = 0

    meanings = list(IDIOM_MEANINGS.items())
    distractor_cycle = cycle(v for _, v in meanings)
    for idiom, meaning in meanings:
        distractors = [next(distractor_cycle) for _ in range(3)]
        options, correct = _build_options(meaning, distractors, counter)
        questions.append(
            {
                "subject": SubjectChoices.JAPANESE,
                "grade_level": "中学2年",
                "prompt": f"熟語『{idiom}』の意味として最も適切なものを選べ。",
                "question_type": "multiple_choice",
                "choices": options,
                "correct_choices": correct,
                "difficulty": DifficultyChoices.STANDARD,
                "tags": ["熟語", "語彙"],
                "source": "generated:idiom",
                "estimated_minutes": 5,
                "pass_threshold": 0.75,
            }
        )
        counter += 1

    for word, reading in KANJI_READINGS:
        distractors = [f"{reading[:-1]}い", f"{reading[:-1]}う", f"{reading[:-1]}ん"]
        options, correct = _build_options(reading, distractors, counter)
        questions.append(
            {
                "subject": SubjectChoices.JAPANESE,
                "grade_level": "高校1年",
                "prompt": f"『{word}』の読みとして正しいものを選べ。",
                "question_type": "multiple_choice",
                "choices": options,
                "correct_choices": correct,
                "difficulty": DifficultyChoices.STANDARD,
                "tags": ["漢字", "読み"],
                "source": "generated:kanji",
                "estimated_minutes": 4,
                "pass_threshold": 0.75,
            }
        )
        counter += 1

    for passage, question, options_list, correct_text in READING_PASSAGES:
        distractors = [opt for opt in options_list if opt != correct_text]
        options, correct = _build_options(correct_text, distractors, counter)
        questions.append(
            {
                "subject": SubjectChoices.JAPANESE,
                "grade_level": "高校1年",
                "prompt": f"{passage}\n{question}",
                "question_type": "multiple_choice",
                "choices": options,
                "correct_choices": correct,
                "difficulty": DifficultyChoices.ADVANCED,
                "tags": ["読解", "心情理解"],
                "source": "generated:reading",
                "estimated_minutes": 7,
                "pass_threshold": 0.8,
            }
        )
        counter += 1

    for sentence, options_list, correct_text in PARTICLE_QUESTIONS:
        distractors = [opt for opt in options_list if opt != correct_text]
        options, correct = _build_options(correct_text, distractors, counter)
        questions.append(
            {
                "subject": SubjectChoices.JAPANESE,
                "grade_level": "中学1年",
                "prompt": f"文中の__に入る助詞として適切なのはどれか。\n『{sentence}』",
                "question_type": "multiple_choice",
                "choices": options,
                "correct_choices": correct,
                "difficulty": DifficultyChoices.BASIC,
                "tags": ["文法", "助詞"],
                "source": "generated:grammar",
                "estimated_minutes": 4,
                "pass_threshold": 0.75,
            }
        )
        counter += 1

    return questions


def build_binggo_lifestyle_challenges() -> list[dict]:
    prompts = [
        "焼き芋を食べる",
        "資格に1つ以上申し込む",
        "いい肉の日に関する看板の写真を撮る",
        "Coke ON で1日12,000歩の目標を設定して達成する",
        "紅葉の写真を撮る",
        "柿を1つ食べる",
        "ツキノワグマと遭遇し無事に帰還する（動物園可）",
        "片足立ち2分チャレンジを動画撮影する",
        "早めのクリスマスツリーの写真を撮る",
        "ツムツムで500万コインを達成",
        "地下深いところでの勝負に挑む",
        "毎日自分の顔写真と日報をLINEで報告する（厳格）",
        "第57回埼玉文学賞に応募",
        "銀杏（ぎんなん）を踏む",
        "牛丼大手3社を15分ですべて回る（動画撮影）",
        "体重を毎日LINEで報告する 目標：山本85kg／古間65kg（厳格化）",
        "今年の漢字を応募する",
        "食べる野菜の種類対決（加工品可）に参加",
        "読書の秋イベント：本を1冊読む",
        "Soraでどうにか自分を動画化する",
        "YouTubeで横動画を作成してアップロード",
        "どんぐりを撮影",
        "都道府県の大きさ順を暗記",
        "ポッキーの日にポッキーの写真を撮る",
        "お酒を飲まない日を作る",
        "東京23区訪問数対決に挑戦",
        "YouTubeショートに投稿し再生数100以上を獲得",
        "鍋を食べる",
        "相手のバイト先にシフト中にバレずに訪問して商品購入",
        "赤とんぼとツーショットを撮る",
        "本選考を5社に出す",
        "相手に得意分野のクイズを出題",
        "今月は太陽の沈まぬ人：1人で0:00〜23:59を30分おきに時計とツーショット（別日可）",
        "家のものを売却して1000円以上稼ぐ",
        "アプリで女性とデート",
        "ジャーナル（日報）を書く",
        "ポケットティッシュ配り集め数対決に参戦",
        "意外な特技を作り発表（古間：指笛／山本：自由）",
        "証明写真の機械の写真を10枚撮影",
        "ピアノで一曲弾けるようにする",
        "おにぎり合計10個を自作して外で食べる",
        "カフェで集中勉強：2時間以上集中する",
        "5kmランニングに挑戦",
        "寿司屋で一貫だけ食べて店を出る",
        "円周率100桁を暗記し最終日に書き出す",
        "美術館または展覧会を一人で訪問",
        "税務クイズサイトに挑戦し全問チャレンジ",
        "自分の家系図を5親等まで詳細に書く",
        "国税庁のクイズに挑戦",
    ]

    challenges: list[dict] = []
    for index, prompt in enumerate(prompts, start=1):
        challenges.append(
            {
                "subject": SubjectChoices.SOCIAL,
                "grade_level": "ライフスタイル",
                "prompt": prompt,
                "question_type": "activity",
                "choices": [{"key": "done", "text": "チャレンジ達成！"}],
                "correct_choices": ["done"],
                "difficulty": DifficultyChoices.STANDARD,
                "tags": ["季節イベント", "ライフログ"],
                "source": "binggo:lifestyle",
                "estimated_minutes": 15,
                "pass_threshold": 0.5,
            }
        )
    return challenges
