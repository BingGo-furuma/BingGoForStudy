const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const getAccessToken = () => (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
const getRefreshToken = () => (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const errorMessage = data?.detail || data?.message || data?.error || 'サーバーエラーが発生しました。';
    const error = new Error(errorMessage);
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
};

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null);
  if (entries.length === 0) {
    return '';
  }
  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `?${query}`;
};

const request = async (endpoint, { method = 'GET', data, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  const accessToken = token || getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshToken();
    if (refreshed?.access) {
      headers.Authorization = `Bearer ${refreshed.access}`;
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse(retryResponse);
    }
  }
  return handleResponse(response);
};

export const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) {
    return null;
  }
  const response = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const data = await handleResponse(response);
  if (data?.access && typeof window !== 'undefined') {
    localStorage.setItem('access_token', data.access);
  }
  return data;
};

export const api = {
  register: (payload) => request('/users/register/', { method: 'POST', data: payload, token: null }),
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(response);
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
    }
    return data;
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
  getProfile: () => request('/users/profile/'),
  updateProfile: (payload) => request('/users/profile/', { method: 'PATCH', data: payload }),
  getCards: (params) => request(`/bingo/cards/${buildQuery(params)}`),
  getCard: (slug) => request(`/bingo/cards/${slug}/`),
  submitTile: (cardSlug, tileId, selectedChoices) =>
    request(`/bingo/cards/${cardSlug}/tiles/${tileId}/submit/`, {
      method: 'POST',
      data: { selected_choices: selectedChoices },
    }),
  getStudyPlan: () => request('/study-plan/'),
  createStudyPlan: (payload) => request('/study-plan/', { method: 'POST', data: payload }),
  updateStudyPlan: (id, payload) => request(`/study-plan/${id}/`, { method: 'PATCH', data: payload }),
  deleteStudyPlan: (id) => request(`/study-plan/${id}/`, { method: 'DELETE' }),
  getNotifications: () => request('/notifications/'),
  markNotificationRead: (id) => request(`/notifications/${id}/`, { method: 'PATCH', data: {} }),
  getResources: () => request('/resources/'),
  getAchievements: () => request('/achievements/'),
  getAttempts: () => request('/attempts/'),
  getInsights: () => request('/bingo/insights/'),
  getCoachingTips: () => request('/bingo/coaching/'),
};
