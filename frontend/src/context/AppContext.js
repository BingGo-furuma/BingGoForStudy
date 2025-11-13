import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  defaultProfile,
  defaultCards,
  defaultPoints,
  initialActivities
} from '../data/bingoCards';
import {
  defaultStudyPlan,
  defaultAchievements,
  defaultNotifications,
  defaultResources,
  defaultCoachingTips,
  defaultInsightData
} from '../data/dashboard';

const STORAGE_PREFIX = 'binggo-study-';

const AppContext = createContext();

const cloneCards = (cards) =>
  cards.map((card) => ({
    ...card,
    tasks: card.tasks.map((task) => ({ ...task })),
    completedLines: [...(card.completedLines || [])]
  }));

const ensureArray = (value, fallback) => (Array.isArray(value) ? value : fallback);

const cloneStudyPlan = (plan = defaultStudyPlan) => ensureArray(plan, defaultStudyPlan).map((item) => ({ ...item }));

const cloneAchievements = (items = defaultAchievements) => ensureArray(items, defaultAchievements).map((item) => ({ ...item }));

const cloneNotifications = (items = defaultNotifications) => ensureArray(items, defaultNotifications).map((item) => ({ ...item }));

const cloneInsights = (insights = defaultInsightData) => ({
  weeklyActivity: ensureArray(insights.weeklyActivity, defaultInsightData.weeklyActivity).map((item) => ({ ...item })),
  subjectPerformance: ensureArray(insights.subjectPerformance, defaultInsightData.subjectPerformance).map((item) => ({
    ...item
  })),
  difficultyBreakdown: ensureArray(insights.difficultyBreakdown, defaultInsightData.difficultyBreakdown).map((item) => ({
    ...item
  })),
  monthlyBingo: ensureArray(insights.monthlyBingo, defaultInsightData.monthlyBingo).map((item) => ({ ...item })),
  recentChallenges: ensureArray(insights.recentChallenges, defaultInsightData.recentChallenges).map((item) => ({ ...item }))
});

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage is not available:', error);
    return null;
  }
};

const loadState = (email) => {
  const storage = getStorage();
  if (!storage || !email) {
    return null;
  }
  const saved = storage.getItem(`${STORAGE_PREFIX}${email}`);
  if (!saved) {
    return null;
  }
  try {
    const parsed = JSON.parse(saved);
    if (!parsed.profile || !parsed.cards || !parsed.points) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse saved state', error);
    return null;
  }
};

const persistState = (email, state) => {
  const storage = getStorage();
  if (!storage || !email) {
    return;
  }
  storage.setItem(`${STORAGE_PREFIX}${email}`, JSON.stringify(state));
};

export const AppProvider = ({ children }) => {
  const [profile, setProfile] = useState(defaultProfile);
  const [cards, setCards] = useState(() => cloneCards(defaultCards));
  const [points, setPoints] = useState(defaultPoints);
  const [activities, setActivities] = useState(initialActivities);
  const [activeEmail, setActiveEmail] = useState(defaultProfile.email);
  const [studyPlan, setStudyPlan] = useState(() => cloneStudyPlan());
  const [achievements, setAchievements] = useState(() => cloneAchievements());
  const [notifications, setNotifications] = useState(() => cloneNotifications());
  const [insights, setInsights] = useState(() => cloneInsights());
  const [resources] = useState(defaultResources);
  const [coachingTips] = useState(defaultCoachingTips);

  const syncToStorage = useCallback(
    (nextState = {}) => {
      const email = nextState?.profile?.email || activeEmail;
      persistState(email, {
        profile,
        cards,
        points,
        activities,
        studyPlan,
        achievements,
        notifications,
        insights,
        ...nextState
      });
    },
    [activeEmail, profile, cards, points, activities, studyPlan, achievements, notifications, insights]
  );

  const resetForEmail = useCallback(
    (email) => {
      const saved = loadState(email);
      if (saved) {
        setProfile(saved.profile);
        setCards(cloneCards(saved.cards));
        setPoints(saved.points);
        setActivities(saved.activities || []);
        setStudyPlan(cloneStudyPlan(saved.studyPlan));
        setAchievements(cloneAchievements(saved.achievements));
        setNotifications(cloneNotifications(saved.notifications));
        setInsights(cloneInsights(saved.insights));
      } else {
        const nextProfile = { ...defaultProfile, email };
        const nextCards = cloneCards(defaultCards);
        const nextPoints = { ...defaultPoints };
        const nextActivities = [...initialActivities];
        const nextPlan = cloneStudyPlan();
        const nextAchievements = cloneAchievements();
        const nextNotifications = cloneNotifications();
        const nextInsights = cloneInsights();
        setProfile(nextProfile);
        setCards(nextCards);
        setPoints(nextPoints);
        setActivities(nextActivities);
        setStudyPlan(nextPlan);
        setAchievements(nextAchievements);
        setNotifications(nextNotifications);
        setInsights(nextInsights);
        persistState(email, {
          profile: nextProfile,
          cards: nextCards,
          points: nextPoints,
          activities: nextActivities,
          studyPlan: nextPlan,
          achievements: nextAchievements,
          notifications: nextNotifications,
          insights: nextInsights
        });
      }
      setActiveEmail(email);
    },
    []
  );

  const updateProfile = useCallback(
    (updates) => {
      setProfile((prev) => {
        const nextProfile = { ...prev, ...updates };
        syncToStorage({ profile: nextProfile });
        return nextProfile;
      });
    },
    [syncToStorage]
  );

  const recordActivity = useCallback(
    (message) => {
      const entry = {
        id: `activity-${Date.now()}`,
        message,
        timestamp: new Date().toISOString()
      };
      setActivities((prev) => {
        const nextActivities = [entry, ...prev].slice(0, 20);
        syncToStorage({ activities: nextActivities });
        return nextActivities;
      });
    },
    [syncToStorage]
  );

  const updateAchievements = useCallback(
    (stats) => {
      const unlocked = [];
      setAchievements((prev) => {
        const next = prev.map((achievement) => {
          if (achievement.isUnlocked) {
            return achievement;
          }
          let shouldUnlock = false;
          switch (achievement.type) {
            case 'cells':
              shouldUnlock = stats.completedCells >= achievement.threshold;
              break;
            case 'bingo':
              shouldUnlock = stats.completedLines >= achievement.threshold;
              break;
            case 'streak':
              shouldUnlock = stats.streak >= achievement.threshold;
              break;
            case 'points':
              shouldUnlock = stats.lifetimePoints >= achievement.threshold;
              break;
            default:
              shouldUnlock = false;
          }
          if (shouldUnlock) {
            const unlockedAchievement = {
              ...achievement,
              isUnlocked: true,
              unlockedAt: new Date().toISOString()
            };
            unlocked.push(unlockedAchievement);
            return unlockedAchievement;
          }
          return achievement;
        });
        if (unlocked.length > 0) {
          syncToStorage({ achievements: next });
        }
        return next;
      });

      if (unlocked.length > 0) {
        unlocked.forEach((achievement) => {
          recordActivity(`実績「${achievement.title}」を獲得しました！`);
        });
        setNotifications((prev) => {
          const achievementNotifications = unlocked.map((achievement) => ({
            id: `notification-achievement-${achievement.id}-${Date.now()}`,
            title: '新しい実績を獲得',
            message: `「${achievement.title}」を獲得しました。おめでとうございます！`,
            type: 'achievement',
            createdAt: new Date().toISOString(),
            isRead: false
          }));
          const next = [...achievementNotifications, ...prev].slice(0, 12);
          syncToStorage({ notifications: next });
          return next;
        });
      }
    },
    [recordActivity, syncToStorage]
  );

  const completeChallenge = useCallback(
    ({ cardId, taskId, score, passed }) => {
      let gainedLines = 0;
      let updatedCardTitle = '';
      let challengeMeta = null;
      let updatedCardsSnapshot = cards;

      setCards((prevCards) => {
        const nextCards = prevCards.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          updatedCardTitle = card.title;
          const nextTasks = card.tasks.map((task) => {
            if (task.id !== taskId) {
              return task;
            }
            challengeMeta = {
              cardId: card.id,
              cardTitle: card.title,
              taskId: task.id,
              category: task.category,
              difficulty: task.difficulty,
              title: task.title
            };
            return {
              ...task,
              isCompleted: passed ? true : task.isCompleted,
              lastScore: score,
              lastAttemptAt: new Date().toISOString(),
              attempts: (task.attempts || 0) + 1
            };
          });

          if (passed) {
            const matrix = Array.from({ length: 5 }, () => Array(5).fill(false));
            nextTasks.forEach((task) => {
              matrix[task.row][task.col] = task.isCompleted || (task.id === taskId && passed);
            });

            const completed = card.completedLines ? [...card.completedLines] : [];
            const checkAndAdd = (identifier) => {
              if (!completed.includes(identifier)) {
                completed.push(identifier);
                gainedLines += 1;
              }
            };

            for (let r = 0; r < 5; r += 1) {
              if (matrix[r].every(Boolean)) {
                checkAndAdd(`row-${r}`);
              }
            }
            for (let c = 0; c < 5; c += 1) {
              const columnComplete = matrix.every((row) => row[c]);
              if (columnComplete) {
                checkAndAdd(`col-${c}`);
              }
            }
            const mainDiagonalComplete = matrix.every((row, index) => row[index]);
            if (mainDiagonalComplete) {
              checkAndAdd('diag-main');
            }
            const antiDiagonalComplete = matrix.every((row, index) => row[4 - index]);
            if (antiDiagonalComplete) {
              checkAndAdd('diag-anti');
            }

            return {
              ...card,
              tasks: nextTasks,
              completedLines: completed,
              lastUpdated: new Date().toISOString()
            };
          }

          return {
            ...card,
            tasks: nextTasks,
            lastUpdated: new Date().toISOString()
          };
        });

        if (passed) {
          const message = `${updatedCardTitle} のマス #${taskId} をクリア (正答率 ${(score * 100).toFixed(0)}%)`;
          recordActivity(message);
        } else {
          const message = `${updatedCardTitle} のマス #${taskId} に再挑戦 (正答率 ${(score * 100).toFixed(0)}%)`;
          recordActivity(message);
        }

        syncToStorage({ cards: nextCards });
        updatedCardsSnapshot = nextCards;
        return nextCards;
      });

      if (passed && challengeMeta) {
        let autoCompletedPlan = null;
        setStudyPlan((prevPlan) => {
          const targetIndex = prevPlan.findIndex(
            (item) => item.subject === challengeMeta.category && item.status !== 'completed'
          );
          if (targetIndex === -1) {
            return prevPlan;
          }
          const nextPlan = prevPlan.map((item, index) => {
            if (index !== targetIndex) {
              return item;
            }
            autoCompletedPlan = {
              ...item,
              status: 'completed',
              completedAt: new Date().toISOString()
            };
            return autoCompletedPlan;
          });
          syncToStorage({ studyPlan: nextPlan });
          return nextPlan;
        });
        if (autoCompletedPlan) {
          recordActivity(`学習計画「${autoCompletedPlan.title}」を完了として記録しました。`);
        }
      }

      const totalCompletedCells = updatedCardsSnapshot.reduce(
        (total, card) => total + card.tasks.filter((task) => task.isCompleted).length,
        0
      );
      const totalCompletedLines = updatedCardsSnapshot.reduce(
        (total, card) => total + (card.completedLines ? card.completedLines.length : 0),
        0
      );

      let nextPointsSnapshot = null;

      setPoints((prevPoints) => {
        const baseIncrement = passed ? 50 : 10;
        const nextPoints = {
          ...prevPoints,
          current: prevPoints.current + baseIncrement,
          lifetime: prevPoints.lifetime + baseIncrement,
          streak: passed ? prevPoints.streak + 1 : 0
        };
        if (passed) {
          nextPoints.bingoCount = prevPoints.bingoCount + gainedLines;
          if (gainedLines > 0) {
            const bonus = 200 * gainedLines;
            nextPoints.current += bonus;
            nextPoints.lifetime += bonus;
          }
        }
        syncToStorage({ points: nextPoints });
        nextPointsSnapshot = nextPoints;
        return nextPoints;
      });

      setInsights((prevInsights) => {
        const now = new Date();
        const nowIso = now.toISOString();
        const todayLabel = weekdayLabels[now.getDay()];
        const weeklyActivity = prevInsights.weeklyActivity.map((entry) => {
          if (entry.day === todayLabel) {
            return {
              ...entry,
              completions: entry.completions + (passed ? 1 : 0)
            };
          }
          return entry;
        });

        const subjectPerformance = prevInsights.subjectPerformance.map((entry) => {
          if (challengeMeta && entry.subject === challengeMeta.category) {
            const attempts = entry.attempts + 1;
            const accuracy = (entry.accuracy * entry.attempts + score) / attempts;
            return { ...entry, attempts, accuracy };
          }
          return entry;
        });

        const difficultyBreakdown = prevInsights.difficultyBreakdown.map((entry) => {
          if (challengeMeta && entry.difficulty === challengeMeta.difficulty) {
            const attempted = entry.attempted + 1;
            const cleared = passed ? Math.min(entry.total, entry.cleared + 1) : entry.cleared;
            return { ...entry, attempted, cleared };
          }
          return entry;
        });

        let monthlyBingo = prevInsights.monthlyBingo;
        if (gainedLines > 0) {
          const monthLabel = `${now.getMonth() + 1}月`;
          let found = false;
          monthlyBingo = prevInsights.monthlyBingo.map((entry) => {
            if (entry.month === monthLabel) {
              found = true;
              return { ...entry, lines: entry.lines + gainedLines };
            }
            return entry;
          });
          if (!found) {
            monthlyBingo = [...prevInsights.monthlyBingo, { month: monthLabel, lines: gainedLines }];
          }
        }

        const recentChallenges = [
          {
            id: `history-${Date.now()}`,
            cardId,
            taskId,
            cardTitle: challengeMeta?.cardTitle || updatedCardTitle,
            category: challengeMeta?.category || '',
            difficulty: challengeMeta?.difficulty || '',
            score,
            passed,
            attemptedAt: nowIso
          },
          ...prevInsights.recentChallenges
        ].slice(0, 15);

        const nextInsights = {
          weeklyActivity,
          subjectPerformance,
          difficultyBreakdown,
          monthlyBingo,
          recentChallenges
        };
        syncToStorage({ insights: nextInsights });
        return nextInsights;
      });

      if (nextPointsSnapshot) {
        updateAchievements({
          completedCells: totalCompletedCells,
          completedLines: totalCompletedLines,
          streak: nextPointsSnapshot.streak,
          lifetimePoints: nextPointsSnapshot.lifetime
        });
      }
    },
    [cards, recordActivity, syncToStorage, updateAchievements]
  );

  const togglePlanTask = useCallback(
    (planId) => {
      let toggledPlan = null;
      setStudyPlan((prevPlan) => {
        const nextPlan = prevPlan.map((item) => {
          if (item.id !== planId) {
            return item;
          }
          const nextStatus = item.status === 'completed' ? 'scheduled' : 'completed';
          const updated = {
            ...item,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : null
          };
          toggledPlan = updated;
          return updated;
        });
        if (toggledPlan) {
          syncToStorage({ studyPlan: nextPlan });
        }
        return nextPlan;
      });

      if (toggledPlan) {
        const message =
          toggledPlan.status === 'completed'
            ? `学習計画「${toggledPlan.title}」を完了しました。`
            : `学習計画「${toggledPlan.title}」を未完了に戻しました。`;
        recordActivity(message);
      }
    },
    [recordActivity, syncToStorage]
  );

  const markNotificationRead = useCallback(
    (notificationId) => {
      setNotifications((prev) => {
        const next = prev.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        );
        syncToStorage({ notifications: next });
        return next;
      });
    },
    [syncToStorage]
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      if (prev.every((notification) => notification.isRead)) {
        return prev;
      }
      const next = prev.map((notification) => ({ ...notification, isRead: true }));
      syncToStorage({ notifications: next });
      return next;
    });
  }, [syncToStorage]);

  const dismissNotification = useCallback(
    (notificationId) => {
      setNotifications((prev) => {
        const next = prev.filter((notification) => notification.id !== notificationId);
        syncToStorage({ notifications: next });
        return next;
      });
    },
    [syncToStorage]
  );

  const contextValue = useMemo(
    () => ({
      profile,
      cards,
      points,
      activities,
      resetForEmail,
      updateProfile,
      recordActivity,
      completeChallenge,
      studyPlan,
      togglePlanTask,
      achievements,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      resources,
      coachingTips,
      insights
    }),
    [
      profile,
      cards,
      points,
      activities,
      resetForEmail,
      updateProfile,
      recordActivity,
      completeChallenge,
      studyPlan,
      togglePlanTask,
      achievements,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      resources,
      coachingTips,
      insights
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
