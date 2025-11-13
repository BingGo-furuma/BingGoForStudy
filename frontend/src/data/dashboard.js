export const defaultStudyPlan = [
  {
    id: 'plan-20250422-evening',
    title: '英語長文演習 (80分)',
    subject: '英語',
    startAt: '2025-04-22T19:00:00+09:00',
    durationMinutes: 80,
    type: '自習',
    location: '自宅',
    status: 'scheduled',
    focusTask: 'standard-track #12 文法チェック',
    resources: ['https://www.nhk.or.jp/kokokoza/english/'],
    coachNote: '時間配分を意識して最後の設問まで解き切る練習をしましょう。'
  },
  {
    id: 'plan-20250423-morning',
    title: '数学IAIIB 復習 (60分)',
    subject: '数学',
    startAt: '2025-04-23T07:00:00+09:00',
    durationMinutes: 60,
    type: '朝活',
    location: '自宅',
    status: 'scheduled',
    focusTask: 'tokyo-u-intensive #7 方程式マスター',
    resources: ['https://www.khanacademy.org/math'],
    coachNote: '前日の誤答を中心に、公式の再確認を行いましょう。'
  },
  {
    id: 'plan-20250423-evening',
    title: '化学基礎 一問一答 (45分)',
    subject: '理科',
    startAt: '2025-04-23T20:30:00+09:00',
    durationMinutes: 45,
    type: 'ライブ授業',
    location: 'オンライン',
    status: 'scheduled',
    focusTask: 'standard-track #18 化学基礎',
    resources: ['https://studyhacker.net/columns/chemistry-basic'],
    coachNote: '講師への質問を2つ用意しておくと理解が深まります。'
  },
  {
    id: 'plan-20250424-evening',
    title: '現代文 記述対策 (50分)',
    subject: '国語',
    startAt: '2025-04-24T19:30:00+09:00',
    durationMinutes: 50,
    type: '添削',
    location: '校舎',
    status: 'scheduled',
    focusTask: 'tokyo-u-intensive #9 現代文リーディング',
    resources: ['https://www.benesse.co.jp/nyushi/kokugo/'],
    coachNote: '添削後の修正プロセスをメモに残しておきましょう。'
  },
  {
    id: 'plan-20250425-night',
    title: '総合振り返り & 週次テスト',
    subject: '総合',
    startAt: '2025-04-25T21:00:00+09:00',
    durationMinutes: 70,
    type: '自己採点',
    location: '自宅',
    status: 'scheduled',
    focusTask: 'english-boost #20 文法チェック',
    resources: ['https://www.ets.org/toefl'],
    coachNote: '週次テスト後は次週の優先度を整理しましょう。'
  }
];

export const defaultAchievements = [
  {
    id: 'achievement-first-clear',
    icon: '🌱',
    title: '初めてのマス開放',
    description: '最初のマスをクリアする',
    type: 'cells',
    threshold: 1,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: 'achievement-ten-clear',
    icon: '🧠',
    title: '10マス制覇',
    description: '10個のマスをクリアする',
    type: 'cells',
    threshold: 10,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: 'achievement-first-bingo',
    icon: '🎉',
    title: '初ビンゴ',
    description: 'ビンゴを1ライン達成する',
    type: 'bingo',
    threshold: 1,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: 'achievement-streak',
    icon: '🔥',
    title: '3日連続チャレンジ',
    description: '学習ストリークを3日に伸ばす',
    type: 'streak',
    threshold: 3,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: 'achievement-points',
    icon: '🏆',
    title: '2000ポイント達成',
    description: '累計ポイントを2000以上にする',
    type: 'points',
    threshold: 2000,
    isUnlocked: false,
    unlockedAt: null
  }
];

export const defaultNotifications = [
  {
    id: 'notification-1',
    title: 'ライブ授業のご案内',
    message: '4/23 20:30〜「化学基礎ライブ授業」が始まります。質問事項を事前にまとめましょう。',
    type: 'schedule',
    createdAt: '2025-04-21T09:00:00+09:00',
    isRead: false
  },
  {
    id: 'notification-2',
    title: '学習レポート更新',
    message: '先週は合計12マスを解きました。週次レポートで弱点をチェックしましょう。',
    type: 'report',
    createdAt: '2025-04-20T18:30:00+09:00',
    isRead: false
  },
  {
    id: 'notification-3',
    title: 'プランの確認',
    message: '金曜日の「総合振り返り & 週次テスト」は90分前に通知されます。忘れずに準備を。',
    type: 'reminder',
    createdAt: '2025-04-19T07:45:00+09:00',
    isRead: true
  }
];

export const defaultResources = [
  {
    id: 'resource-english',
    title: '共通テスト 英語 予想問題2025',
    type: 'PDF教材',
    description: '最新傾向を押さえた文法・長文の良問を厳選。',
    link: 'https://www.kawai-juku.ac.jp/moshi/kyotsu/english/'
  },
  {
    id: 'resource-math',
    title: '数学IAIIB 苦手克服講義',
    type: 'オンデマンド講座',
    description: 'ミスしやすい問題の解説を短時間で復習。',
    link: 'https://www.zkai.co.jp/high/special/math/'
  },
  {
    id: 'resource-chemistry',
    title: '化学基礎用語カード',
    type: 'スプレッドシート',
    description: '暗記カード形式で覚えやすくまとめた用語リスト。',
    link: 'https://docs.google.com/spreadsheets'
  }
];

export const defaultCoachingTips = [
  {
    id: 'tip-1',
    title: '今日のフォーカス',
    message: '数学 #7 の正答率が70%に届いていません。朝の学習時間を活用して復習しましょう。',
    actionLabel: '対象ミッションを開く',
    actionLink: '/bingo/tokyo-u-intensive'
  },
  {
    id: 'tip-2',
    title: 'リスニングを底上げ',
    message: '英語4技能カードで未挑戦のリスニング問題が5つあります。音源をダウンロードして通学時間に学習しましょう。',
    actionLabel: '音源をダウンロード',
    actionLink: 'https://www.ets.org/toefl'
  }
];

export const defaultInsightData = {
  weeklyActivity: [
    { day: '月', completions: 3 },
    { day: '火', completions: 4 },
    { day: '水', completions: 2 },
    { day: '木', completions: 5 },
    { day: '金', completions: 3 },
    { day: '土', completions: 4 },
    { day: '日', completions: 2 }
  ],
  subjectPerformance: [
    { subject: '英語', accuracy: 0.82, target: 0.85, attempts: 18 },
    { subject: '数学', accuracy: 0.74, target: 0.8, attempts: 16 },
    { subject: '理科', accuracy: 0.79, target: 0.83, attempts: 12 },
    { subject: '社会', accuracy: 0.88, target: 0.9, attempts: 9 },
    { subject: '国語', accuracy: 0.81, target: 0.85, attempts: 11 }
  ],
  difficultyBreakdown: [
    { difficulty: '基礎', cleared: 22, attempted: 24, total: 30 },
    { difficulty: '標準', cleared: 18, attempted: 25, total: 32 },
    { difficulty: '発展', cleared: 10, attempted: 19, total: 28 }
  ],
  monthlyBingo: [
    { month: '2月', lines: 1 },
    { month: '3月', lines: 2 },
    { month: '4月', lines: 1 },
    { month: '5月', lines: 0 }
  ],
  recentChallenges: [
    {
      id: 'history-1',
      cardId: 'standard-track',
      taskId: 3,
      cardTitle: '共通テスト完成コース',
      category: '数学',
      difficulty: '標準',
      score: 0.84,
      passed: true,
      attemptedAt: '2025-04-18T21:00:00+09:00'
    },
    {
      id: 'history-2',
      cardId: 'tokyo-u-intensive',
      taskId: 7,
      cardTitle: '東大記述対策カード',
      category: '国語',
      difficulty: '発展',
      score: 0.68,
      passed: false,
      attemptedAt: '2025-04-17T20:10:00+09:00'
    },
    {
      id: 'history-3',
      cardId: 'english-boost',
      taskId: 12,
      cardTitle: '英語4技能完成カード',
      category: '英語',
      difficulty: '応用',
      score: 0.91,
      passed: true,
      attemptedAt: '2025-04-16T19:40:00+09:00'
    }
  ]
};
