import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  defaultProfile,
  defaultCards,
  defaultPoints,
  initialActivities
} from '../data/bingoCards';

const STORAGE_PREFIX = 'binggo-study-';

const AppContext = createContext();

const cloneCards = (cards) => cards.map((card) => ({
  ...card,
  tasks: card.tasks.map((task) => ({ ...task })),
  completedLines: [...(card.completedLines || [])]
}));

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

  const syncToStorage = useCallback(
    (nextState) => {
      const email = nextState?.profile?.email || activeEmail;
      persistState(email, {
        profile: nextState?.profile || profile,
        cards: nextState?.cards || cards,
        points: nextState?.points || points,
        activities: nextState?.activities || activities
      });
    },
    [activeEmail, profile, cards, points, activities]
  );

  const resetForEmail = useCallback(
    (email) => {
      const saved = loadState(email);
      if (saved) {
        setProfile(saved.profile);
        setCards(cloneCards(saved.cards));
        setPoints(saved.points);
        setActivities(saved.activities || []);
      } else {
        const nextProfile = { ...defaultProfile, email };
        const nextCards = cloneCards(defaultCards);
        const nextPoints = { ...defaultPoints };
        const nextActivities = [...initialActivities];
        setProfile(nextProfile);
        setCards(nextCards);
        setPoints(nextPoints);
        setActivities(nextActivities);
        persistState(email, {
          profile: nextProfile,
          cards: nextCards,
          points: nextPoints,
          activities: nextActivities
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

  const completeChallenge = useCallback(
    ({ cardId, taskId, score, passed }) => {
      let gainedLines = 0;
      let updatedCardTitle = '';

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
        return nextCards;
      });

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
        return nextPoints;
      });
    },
    [recordActivity, syncToStorage]
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
      completeChallenge
    }),
    [profile, cards, points, activities, resetForEmail, updateProfile, recordActivity, completeChallenge]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
