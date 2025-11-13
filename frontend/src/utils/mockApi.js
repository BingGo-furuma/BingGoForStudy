const USERS_KEY = 'binggo-users';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage is not available', error);
    return null;
  }
};

const loadUsers = () => {
  const storage = getStorage();
  if (!storage) {
    return [];
  }
  const saved = storage.getItem(USERS_KEY);
  if (!saved) {
    const seed = [{ email: 'test@example.com', password: 'password', name: '三木 さくら' }];
    storage.setItem(USERS_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse stored users', error);
  }
  return [];
};

const saveUsers = (users) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(USERS_KEY, JSON.stringify(users));
};

const createToken = (email) => `mock-${btoa(`${email}-${Date.now()}`)}`;

const simulateDelay = (callback, delay = 600) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = callback();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });

export const mockApi = {
  register: async ({ email, password, name }) =>
    simulateDelay(() => {
      if (!email || !password) {
        throw new Error('メールアドレスとパスワードを入力してください。');
      }
      const users = loadUsers();
      if (users.some((user) => user.email === email)) {
        throw new Error('既に登録済みのメールアドレスです。');
      }
      const nextUsers = [...users, { email, password, name: name || '' }];
      saveUsers(nextUsers);
      return { ok: true };
    }),

  login: async (email, password) =>
    simulateDelay(() => {
      const users = loadUsers();
      const user = users.find((item) => item.email === email && item.password === password);
      if (!user) {
        throw new Error('メールアドレスまたはパスワードが正しくありません。');
      }
      return {
        access: createToken(email),
        refresh: createToken(`${email}-refresh`),
        user: { email: user.email, name: user.name }
      };
    })
};
