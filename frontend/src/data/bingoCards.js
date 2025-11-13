export const defaultProfile = {
  id: 'user-default',
  name: '三木 さくら',
  email: 'test@example.com',
  grade: '高校3年',
  avatarColor: '#f97316',
  goalSchools: ['東京大学 文科一類', '一橋大学 経済学部'],
  paymentMethod: 'クレジットカード (**** 4281)',
  subscription: {
    planName: 'BingGo スタンダード',
    status: '有効',
    renewalDate: '2025-05-01'
  },
  studySchedule: '平日 19:00-21:00 / 土曜 10:00-13:00',
  preferredSubjects: ['数学IAIIB', '英語リーディング', '現代文'],
  guardianContact: '保護者：三木 太郎 (090-0000-0000)',
  notes: '共通テストで8割を目標。苦手科目は数学II。'
};

const questionTemplates = [
  {
    category: '数学',
    difficulty: '標準',
    title: '方程式マスター',
    description: '一次方程式と基本的な関数を押さえましょう。',
    passThreshold: 0.8,
    questions: [
      {
        prompt: '2x + 4 = 10 のとき x の値は？',
        options: ['2', '3', '4', '6'],
        correctIndex: 1,
        explanation: '両辺から4を引いて6、x=3。'
      },
      {
        prompt: 'f(x) = 3x - 1 のとき f(4) の値は？',
        options: ['11', '12', '13', '14'],
        correctIndex: 0,
        explanation: '3×4-1=11。'
      }
    ]
  },
  {
    category: '英語',
    difficulty: '標準',
    title: '文法チェック',
    description: '高校英語の必須文法を確認。',
    passThreshold: 0.7,
    questions: [
      {
        prompt: 'Choose the correct option: "She ___ tennis every Sunday."',
        options: ['play', 'plays', 'playing', 'played'],
        correctIndex: 1,
        explanation: '三人称単数現在なので plays。'
      },
      {
        prompt: '空欄に入る最も適切な語は？ "I have lived in Kyoto ___ five years."',
        options: ['since', 'during', 'for', 'while'],
        correctIndex: 2,
        explanation: '期間を表すので for。'
      }
    ]
  },
  {
    category: '理科',
    difficulty: '基礎',
    title: '化学基礎',
    description: '理論化学の用語整理を行います。',
    passThreshold: 0.75,
    questions: [
      {
        prompt: '酸と塩基の定義で、プロトンを受け取る物質は？',
        options: ['酸', '塩基', '中性物質', '酸化剤'],
        correctIndex: 1,
        explanation: 'ブレンステッド-ローリーの定義で塩基。'
      },
      {
        prompt: '水の凝固点は摂氏何度？',
        options: ['-10℃', '0℃', '25℃', '100℃'],
        correctIndex: 1,
        explanation: '標準状態で0℃。'
      }
    ]
  },
  {
    category: '社会',
    difficulty: '標準',
    title: '日本史ハイライト',
    description: '近代史の重要事項を整理。',
    passThreshold: 0.8,
    questions: [
      {
        prompt: '明治維新後、最初の近代的憲法は？',
        options: ['五箇条の御誓文', '明治憲法', '日本国憲法', '大日本帝国憲法'],
        correctIndex: 3,
        explanation: '正式名称は大日本帝国憲法。'
      },
      {
        prompt: '第一次世界大戦後のパリ講和会議で日本が主張したのは？',
        options: ['五大国の脱退', '民族自決の否定', '人種平等案', '無条件降伏要求'],
        correctIndex: 2,
        explanation: '日本は人種平等案を提案した。'
      }
    ]
  },
  {
    category: '国語',
    difficulty: '発展',
    title: '現代文リーディング',
    description: '文章読解の力を磨きます。',
    passThreshold: 0.75,
    questions: [
      {
        prompt: '「杜甫の詩」を論じた文章の主張として適切なのは？',
        options: ['杜甫は自然主義の作家である', '社会批判性が強い', '恋愛を題材にする', '日常生活を詩にした'],
        correctIndex: 1,
        explanation: '杜甫は社会性の高い詩で知られる。'
      },
      {
        prompt: '「漱石と鷗外」の論争は何をめぐるものか？',
        options: ['俳句の形式', '近代小説のあり方', '漢詩の解釈', '演劇の手法'],
        correctIndex: 1,
        explanation: '近代小説の方向性についての論争。'
      }
    ]
  }
];

const buildTasks = (cardId) => {
  const tasks = [];
  for (let i = 1; i <= 25; i += 1) {
    const template = questionTemplates[(i - 1) % questionTemplates.length];
    const row = Math.floor((i - 1) / 5);
    const col = (i - 1) % 5;
    tasks.push({
      id: i,
      row,
      col,
      title: `${template.title} ${i}`,
      category: template.category,
      difficulty: template.difficulty,
      description: template.description,
      passThreshold: template.passThreshold,
      questions: template.questions.map((question, index) => ({
        id: `${cardId}-${i}-q${index + 1}`,
        prompt: question.prompt,
        options: question.options.map((text, optionIndex) => ({
          id: `${cardId}-${i}-q${index + 1}-opt${optionIndex + 1}`,
          label: text
        })),
        correctOptionId: `${cardId}-${i}-q${index + 1}-opt${question.correctIndex + 1}`,
        explanation: question.explanation
      })),
      isCompleted: false,
      lastScore: null,
      lastAttemptAt: null,
      attempts: 0,
      resources: [
        'https://www.khanacademy.org/',
        'https://www.nhk.or.jp/kokokoza/'
      ]
    });
  }
  return tasks;
};

export const defaultCards = [
  {
    id: 'standard-track',
    title: '共通テスト完成コース',
    description: '主要5教科をバランスよく仕上げるためのベーシックカード。',
    tags: ['共通テスト', '総合', '基礎固め'],
    difficulty: '標準',
    createdAt: '2025-01-05',
    tasks: buildTasks('standard-track'),
    completedLines: [],
    lastUpdated: null
  },
  {
    id: 'tokyo-u-intensive',
    title: '東大記述対策カード',
    description: '東大受験生向けの記述・論述に特化したチャレンジセット。',
    tags: ['難関大', '論述', '添削'],
    difficulty: '発展',
    createdAt: '2025-01-12',
    tasks: buildTasks('tokyo-u-intensive'),
    completedLines: [],
    lastUpdated: null
  },
  {
    id: 'english-boost',
    title: '英語4技能完成カード',
    description: 'リスニングからスピーキングまで幅広くカバーします。',
    tags: ['英語', '4技能', 'スピーキング'],
    difficulty: '応用',
    createdAt: '2025-01-20',
    tasks: buildTasks('english-boost'),
    completedLines: [],
    lastUpdated: null
  }
];

export const defaultPoints = {
  current: 1280,
  lifetime: 3420,
  streak: 4,
  bingoCount: 1
};

export const initialActivities = [
  {
    id: 'activity-1',
    message: '共通テスト完成コースのマス #3 をクリア (正答率 80%)',
    timestamp: '2025-03-01T09:30:00+09:00'
  },
  {
    id: 'activity-2',
    message: '東大記述対策カードのマス #7 を復習しました',
    timestamp: '2025-02-28T20:10:00+09:00'
  }
];
