import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';

const AppContext = createContext();

export const ProgramTypes = {
  STUDY: 'study',
  BINGGO: 'binggo',
};

const toCamelProfile = (data) => ({
  id: data.id,
  email: data.email,
  name: data.name,
  grade: data.grade || '',
  avatarColor: data.avatar_color || '#2563eb',
  goalSchools: Array.isArray(data.goal_schools) ? data.goal_schools : [],
  paymentMethod: data.payment_method || '',
  subscription: {
    planName: data.subscription_plan || 'BingGo フリープラン',
    status: data.subscription_status || 'trial',
    renewalDate: data.subscription_renewal || null,
  },
  studySchedule: data.study_schedule || '',
  preferredSubjects: Array.isArray(data.preferred_subjects) ? data.preferred_subjects : [],
  guardianContact: data.guardian_contact || '',
  notes: data.notes || '',
  points: data.points || 0,
  binggoPoints: data.binggo_points || 0,
});

const adaptTileToTask = (tile) => ({
  id: tile.id,
  row: tile.row,
  col: tile.column,
  title: tile.challenge.prompt.slice(0, 30),
  category: tile.challenge.subject,
  difficulty: tile.challenge.difficulty,
  description:
    tile.challenge.question_type === 'activity'
      ? tile.challenge.prompt
      : tile.challenge.tags.join('／') || tile.challenge.prompt,
  prompt: tile.challenge.prompt,
  questionType: tile.challenge.question_type,
  passThreshold: Number(tile.challenge.pass_threshold),
  questions: [
    {
      id: `${tile.id}-q1`,
      prompt: tile.challenge.prompt,
      options: tile.challenge.options.map((option) => ({ id: option.key, label: option.text })),
      explanation: tile.challenge.explanation || '正答例を確認し、解き直してみましょう。',
    },
  ],
  isCompleted: Boolean(tile.progress?.is_completed),
  lastScore:
    tile.progress && tile.progress.best_score !== null && tile.progress.best_score !== undefined
      ? Number(tile.progress.best_score) / 100
      : null,
  lastAttemptAt: tile.progress?.last_attempt_at || null,
  attempts: tile.progress?.attempts || 0,
  rewardPoints: tile.reward_points,
  recommendedMinutes: tile.recommended_minutes,
  resources: (tile.challenge.tags || []).map((tag, index) => ({
    id: `${tile.id}-tag-${index}`,
    label: tag,
    url: null,
  })),
});

const adaptCardDetail = (card) => ({
  id: card.slug,
  backendId: card.id,
  title: card.title,
  description: card.summary,
  tags: Array.isArray(card.tags) ? card.tags : [],
  difficulty: card.difficulty,
  createdAt: card.created_at,
  completedLines: card.completed_lines || [],
  totalTiles: card.total_tiles,
  completedTiles: card.completed_tiles,
  pointsEarned: card.points_earned,
  programType: card.program_type,
  periodStart: card.period_start,
  periodEnd: card.period_end,
  monthlyLabel: card.monthly_label,
  isActive: card.is_active,
  tasks: card.tiles.map(adaptTileToTask),
});

const adaptStudyPlan = (entries) =>
  entries.map((item) => ({
    id: item.id,
    title: item.title,
    subject: item.subject,
    type: item.plan_type || '自習',
    location: item.location || '自宅',
    startAt: `${item.scheduled_for}T${item.start_time || '19:00:00'}`,
    durationMinutes: item.duration_minutes,
    status: item.status,
    coachNote: item.coach_note || '',
    bingoTileId: item.bingo_tile,
  }));

const adaptNotifications = (items) =>
  items.map((item) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    category: item.category,
    createdAt: item.created_at,
    isRead: Boolean(item.read_at),
  }));

const adaptCoachingTips = (items) =>
  items.map((tip) => ({
    id: tip.id,
    subject: tip.subject,
    title: tip.title,
    message: tip.content,
    actionLabel: '詳細を見る',
    actionLink: '#',
  }));

const adaptInsights = (data) => ({
  weeklyActivity: (data.weekly_activity || []).map((entry) => ({
    day: entry.date.slice(5),
    completions: entry.attempts,
  })),
  subjectPerformance: (data.subject_performance || []).map((entry) => ({
    subject: entry.label,
    accuracy: entry.rate / 100,
    attempts: entry.attempts,
    target: 0.85,
  })),
  difficultyBreakdown: (data.difficulty_breakdown || []).map((entry) => ({
    difficulty: entry.label,
    accuracy: entry.rate / 100,
    attempts: entry.attempts,
  })),
  monthlyBingo: data.monthly_bingo || [],
  recentChallenges: data.recent_challenges || [],
});

const calculateStreak = (attempts) => {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    return 0;
  }
  const uniqueDays = Array.from(
    new Set(attempts.map((attempt) => attempt.created_at.slice(0, 10)))
  ).sort();
  let streak = 0;
  let previous = null;
  uniqueDays.forEach((day) => {
    if (!previous) {
      streak = 1;
      previous = day;
      return;
    }
    const currentDate = new Date(day);
    const previousDate = new Date(previous);
    const diff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak += 1;
    } else if (diff > 1) {
      streak = 1;
    }
    previous = day;
  });
  return streak;
};

const buildPoints = (profile, cards, attempts) => ({
  current: profile.points,
  lifetime: profile.points,
  streak: calculateStreak(attempts),
  bingoCount: cards.reduce((total, card) => total + card.completedLines.length, 0),
});

const adaptResources = (items) =>
  items.map((resource) => ({
    id: resource.id,
    subject: resource.subject,
    title: resource.title,
    description: resource.description,
    url: resource.url,
    type: resource.resource_type,
    estimatedMinutes: resource.estimated_minutes,
  }));

const buildActivities = (attempts, notifications) => {
  const attemptActivities = attempts.slice(0, 10).map((attempt) => ({
    id: `attempt-${attempt.id}`,
    title: 'チャレンジに挑戦しました',
    timestamp: attempt.created_at,
    description: `${attempt.challenge.prompt.slice(0, 24)}… ／ 正答率 ${Math.round(attempt.score)}%`,
  }));
  const notificationActivities = notifications.slice(0, 5).map((notification) => ({
    id: `notification-${notification.id}`,
    title: notification.title,
    timestamp: notification.created_at,
    description: notification.message,
  }));
  return [...attemptActivities, ...notificationActivities]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
};

const defaultProfileState = {
  id: '',
  email: '',
  name: '',
  grade: '',
  avatarColor: '#2563eb',
  goalSchools: [],
  paymentMethod: '',
  subscription: { planName: 'BingGo フリープラン', status: 'trial', renewalDate: null },
  studySchedule: '',
  preferredSubjects: [],
  guardianContact: '',
  notes: '',
  points: 0,
  binggoPoints: 0,
};

const initialBinggoMetrics = {
  activeCardId: null,
  completed: 0,
  total: 0,
  progress: 0,
  nextDeadline: null,
  monthlyLabel: '',
  daysRemaining: null,
  points: 0,
};

export const AppProvider = ({ children }) => {
  const [profile, setProfile] = useState(defaultProfileState);
  const [cards, setCards] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [coachingTips, setCoachingTips] = useState([]);
  const [insights, setInsights] = useState({ weeklyActivity: [], subjectPerformance: [], difficultyBreakdown: [], monthlyBingo: [], recentChallenges: [] });
  const [attempts, setAttempts] = useState([]);
  const [points, setPoints] = useState({ current: 0, lifetime: 0, streak: 0, bingoCount: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [experience, setExperience] = useState(() => {
    if (typeof window === 'undefined') {
      return ProgramTypes.STUDY;
    }
    return localStorage.getItem('binggo:experience') || ProgramTypes.STUDY;
  });
  const [binggoCards, setBinggoCards] = useState([]);
  const [binggoMetrics, setBinggoMetrics] = useState(initialBinggoMetrics);
  const [binggoActivity, setBinggoActivity] = useState([]);
  const [binggoUpcoming, setBinggoUpcoming] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('binggo:experience', experience);
    }
  }, [experience]);

  const fetchCardsWithDetails = useCallback(async (program) => {
    const summaries = await api.getCards(program ? { program } : undefined);
    const details = await Promise.all(summaries.map((card) => api.getCard(card.slug)));
    return details.map(adaptCardDetail);
  }, []);

  const loadStudyDomain = useCallback(async () => {
    const [cardsPayload, planData, notificationData, resourceData, achievementData, attemptData, insightData, tipsData] =
      await Promise.all([
        fetchCardsWithDetails(ProgramTypes.STUDY),
        api.getStudyPlan(),
        api.getNotifications(),
        api.getResources(),
        api.getAchievements(),
        api.getAttempts(),
        api.getInsights(),
        api.getCoachingTips(),
      ]);

    const notificationsPayload = adaptNotifications(notificationData);
    const attemptsPayload = attemptData.map((item) => {
      const { card_slug: cardSlug, card_title: cardTitle, card_program_type: cardProgramType, ...rest } = item;
      return {
        ...rest,
        cardSlug,
        cardTitle,
        cardProgramType,
        score: Number(item.score),
      };
    });

    setCards(cardsPayload);
    setStudyPlan(adaptStudyPlan(planData));
    setNotifications(notificationsPayload);
    setResources(adaptResources(resourceData));
    setAchievements(achievementData);
    setAttempts(attemptsPayload);
    setCoachingTips(adaptCoachingTips(tipsData));
    setInsights(adaptInsights(insightData));

    return { cardsPayload, attemptsPayload, notificationsPayload };
  }, [fetchCardsWithDetails]);

  const loadBinggoDomain = useCallback(async () => {
    const cardsPayload = await fetchCardsWithDetails(ProgramTypes.BINGGO);
    setBinggoCards(cardsPayload);
    return cardsPayload;
  }, [fetchCardsWithDetails]);

  const loadInitialData = useCallback(
    async (program = experience) => {
      setLoading(true);
      setError('');
      try {
        const profileData = await api.getProfile();
        const profilePayload = toCamelProfile(profileData);
        setProfile(profilePayload);

        const [studyResult, binggoResult] = await Promise.all([
          loadStudyDomain(),
          loadBinggoDomain(),
        ]);

        const studyAttempts = studyResult.attemptsPayload.filter(
          (attempt) => attempt.cardProgramType !== ProgramTypes.BINGGO
        );
        setPoints(buildPoints(profilePayload, studyResult.cardsPayload, studyAttempts));
        setActivities(buildActivities(studyAttempts, studyResult.notificationsPayload));

        if (program === ProgramTypes.BINGGO && binggoResult.length === 0) {
          setBinggoCards(binggoResult);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    },
    [experience, loadStudyDomain, loadBinggoDomain]
  );

  const refreshCard = useCallback(
    async (cardIdentifier) => {
      const targetStudy = cards.find(
        (card) => card.id === cardIdentifier || String(card.backendId) === String(cardIdentifier)
      );
      const targetBinggo = binggoCards.find(
        (card) => card.id === cardIdentifier || String(card.backendId) === String(cardIdentifier)
      );
      const slug = targetStudy?.id || targetBinggo?.id || cardIdentifier;
      const detail = await api.getCard(slug);
      const adapted = adaptCardDetail(detail);
      if (adapted.programType === ProgramTypes.BINGGO) {
        setBinggoCards((prev) => {
          const exists = prev.some((card) => card.id === adapted.id);
          if (exists) {
            return prev.map((card) => (card.id === adapted.id ? adapted : card));
          }
          return [...prev, adapted];
        });
      } else {
        setCards((prev) => {
          const exists = prev.some((card) => card.id === adapted.id);
          if (exists) {
            return prev.map((card) => (card.id === adapted.id ? adapted : card));
          }
          return [...prev, adapted];
        });
      }
      return adapted;
    },
    [cards, binggoCards]
  );

  const completeChallenge = useCallback(
    async ({ cardId, taskId, responses }) => {
      const targetStudy = cards.find(
        (card) => card.id === cardId || String(card.backendId) === String(cardId)
      );
      const targetBinggo = binggoCards.find(
        (card) => card.id === cardId || String(card.backendId) === String(cardId)
      );
      const slug = targetStudy?.id || targetBinggo?.id || cardId;
      const choiceList = (Array.isArray(responses) ? responses : Object.values(responses || {})).filter(Boolean);
      const payload = await api.submitTile(slug, taskId, choiceList);
      const adaptedCard = await refreshCard(slug);
      const [
        profileData,
        attemptData,
        achievementData,
        notificationData,
        insightData,
        planData,
      ] = await Promise.all([
        api.getProfile(),
        api.getAttempts(),
        api.getAchievements(),
        api.getNotifications(),
        api.getInsights(),
        api.getStudyPlan(),
      ]);

      const profilePayload = toCamelProfile(profileData);
      const notificationsPayload = adaptNotifications(notificationData);
      const attemptsPayload = attemptData.map((item) => {
        const { card_slug: cardSlug, card_title: cardTitle, card_program_type: cardProgramType, ...rest } = item;
        return {
          ...rest,
          cardSlug,
          cardTitle,
          cardProgramType,
          score: Number(item.score),
        };
      });
      const updatedStudyCards = (() => {
        if (adaptedCard.programType === ProgramTypes.BINGGO) {
          return cards;
        }
        const replaced = cards.map((card) => (card.id === adaptedCard.id ? adaptedCard : card));
        return replaced.some((card) => card.id === adaptedCard.id)
          ? replaced
          : [...cards, adaptedCard];
      })();
      const updatedBinggoCards = (() => {
        if (adaptedCard.programType !== ProgramTypes.BINGGO) {
          return binggoCards;
        }
        const replaced = binggoCards.map((card) => (card.id === adaptedCard.id ? adaptedCard : card));
        return replaced.some((card) => card.id === adaptedCard.id)
          ? replaced
          : [...binggoCards, adaptedCard];
      })();
      const studyAttempts = attemptsPayload.filter(
        (attempt) => attempt.cardProgramType !== ProgramTypes.BINGGO
      );

      setProfile(profilePayload);
      setAttempts(attemptsPayload);
      setAchievements(achievementData);
      setNotifications(notificationsPayload);
      setInsights(adaptInsights(insightData));
      setStudyPlan(adaptStudyPlan(planData));
      if (adaptedCard.programType === ProgramTypes.BINGGO) {
        setBinggoCards(updatedBinggoCards);
      } else {
        setCards(updatedStudyCards);
      }
      setPoints(buildPoints(profilePayload, updatedStudyCards, studyAttempts));
      setActivities(buildActivities(studyAttempts, notificationsPayload));

      const correctChoices = payload.result.correct_choices || [];
      const correctCount = correctChoices.filter((choice) => choiceList.includes(choice)).length;
      const totalCount = correctChoices.length || choiceList.length || 1;
      return {
        score: payload.result.score / 100,
        passed: payload.result.is_passed,
        correct: correctCount,
        total: totalCount,
        feedback: payload.result.is_passed
          ? '素晴らしいです！この調子で次のマスにも挑戦しましょう。'
          : 'あと少しで合格です。解説を参考に復習してみましょう。',
        explanation: payload.result.explanation,
        awardedPoints: payload.result.awarded_points,
      };
    },
    [binggoCards, cards, refreshCard]
  );

  useEffect(() => {
    if (!profile.id || binggoCards.length === 0) {
      setBinggoMetrics(initialBinggoMetrics);
      setBinggoActivity([]);
      setBinggoUpcoming([]);
      return;
    }
    const activeCard = binggoCards.find((card) => card.isActive) || binggoCards[0];
    if (!activeCard) {
      setBinggoMetrics(initialBinggoMetrics);
      setBinggoActivity([]);
      setBinggoUpcoming([]);
      return;
    }
    const completed = activeCard.tasks.filter((task) => task.isCompleted).length;
    const total = activeCard.tasks.length;
    const progress = total ? completed / total : 0;
    const nextDeadline = activeCard.periodEnd;
    const monthlyLabel = activeCard.monthlyLabel || activeCard.title;
    const daysRemaining = nextDeadline
      ? Math.max(0, Math.ceil((new Date(nextDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;
    setBinggoMetrics({
      activeCardId: activeCard.id,
      completed,
      total,
      progress,
      nextDeadline,
      monthlyLabel,
      daysRemaining,
      points: profile.binggoPoints,
    });

    const relevantAttempts = attempts
      .filter(
        (attempt) =>
          attempt.cardProgramType === ProgramTypes.BINGGO &&
          (attempt.cardSlug === activeCard.id || attempt.cardTitle === activeCard.title)
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8)
      .map((attempt) => ({
        id: attempt.id,
        title: attempt.challenge?.prompt?.slice(0, 40) || attempt.cardTitle,
        score: attempt.score,
        isPassed: attempt.is_passed,
        createdAt: attempt.created_at,
      }));
    setBinggoActivity(relevantAttempts);

    const upcoming = activeCard.tasks.filter((task) => !task.isCompleted).slice(0, 6);
    setBinggoUpcoming(upcoming);
  }, [profile, binggoCards, attempts]);

  const markNotificationRead = useCallback(async (notificationId) => {
    await api.markNotificationRead(notificationId);
    setNotifications((prev) => prev.map((notification) => (notification.id === notificationId ? { ...notification, isRead: true } : notification)));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await Promise.all(notifications.filter((item) => !item.isRead).map((item) => api.markNotificationRead(item.id)));
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  }, [notifications]);

  const dismissNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
  }, []);

  const createPlanItem = useCallback(async (payload) => {
    const requestBody = {
      title: payload.title,
      subject: payload.subject,
      plan_type: payload.type,
      location: payload.location,
      scheduled_for: payload.startAt.slice(0, 10),
      start_time: payload.startAt.slice(11, 19),
      duration_minutes: payload.durationMinutes,
      status: payload.status,
      bingo_tile: payload.bingoTileId,
      coach_note: payload.coachNote,
    };
    const created = await api.createStudyPlan(requestBody);
    setStudyPlan((prev) => [...prev, ...adaptStudyPlan([created])]);
    return created;
  }, []);

  const updatePlanItem = useCallback(async (id, payload) => {
    const requestBody = {
      title: payload.title,
      subject: payload.subject,
      plan_type: payload.type,
      location: payload.location,
      scheduled_for: payload.startAt.slice(0, 10),
      start_time: payload.startAt.slice(11, 19),
      duration_minutes: payload.durationMinutes,
      status: payload.status,
      coach_note: payload.coachNote,
    };
    const updated = await api.updateStudyPlan(id, requestBody);
    const adapted = adaptStudyPlan([updated])[0];
    setStudyPlan((prev) => prev.map((item) => (item.id === id ? adapted : item)));
    return adapted;
  }, []);

  const togglePlanTask = useCallback(
    async (id) => {
      const target = studyPlan.find((item) => item.id === id);
      if (!target) {
        return;
      }
      const nextStatus = target.status === 'completed' ? 'scheduled' : 'completed';
      await updatePlanItem(id, { ...target, status: nextStatus });
    },
    [studyPlan, updatePlanItem]
  );

  const deletePlanItem = useCallback(async (id) => {
    await api.deleteStudyPlan(id);
    setStudyPlan((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const requestBody = {
      name: payload.name,
      grade: payload.grade,
      study_schedule: payload.studySchedule,
      payment_method: payload.paymentMethod,
      notes: payload.notes,
      goal_schools: payload.goalSchools,
      preferred_subjects: payload.preferredSubjects,
      guardian_contact: payload.guardianContact,
    };
    const updated = await api.updateProfile(requestBody);
    const profilePayload = toCamelProfile(updated);
    setProfile(profilePayload);
    return profilePayload;
  }, []);

  const selectExperience = useCallback(
    (nextExperience, { preload = false } = {}) => {
      setExperience(nextExperience);
      if (preload) {
        loadInitialData(nextExperience);
      }
    },
    [loadInitialData]
  );

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      loadInitialData();
    }
  }, [loadInitialData]);

  const contextValue = useMemo(
    () => ({
      profile,
      cards,
      experience,
      selectExperience,
      binggoCards,
      binggoMetrics,
      binggoActivity,
      binggoUpcoming,
      studyPlan,
      notifications,
      resources,
      achievements,
      coachingTips,
      insights,
      attempts,
      points,
      activities,
      loading,
      error,
      loadInitialData,
      completeChallenge,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      createPlanItem,
      updatePlanItem,
      deletePlanItem,
      togglePlanTask,
      updateProfile,
      refreshCard,
    }),
    [
      profile,
      cards,
      experience,
      selectExperience,
      binggoCards,
      binggoMetrics,
      binggoActivity,
      binggoUpcoming,
      studyPlan,
      notifications,
      resources,
      achievements,
      coachingTips,
      insights,
      attempts,
      points,
      activities,
      loading,
      error,
      loadInitialData,
      completeChallenge,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      createPlanItem,
      updatePlanItem,
      deletePlanItem,
      togglePlanTask,
      updateProfile,
      refreshCard,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
