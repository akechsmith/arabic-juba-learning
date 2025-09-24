import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const lessonsService = {
  getLessons: () => api.get('/lessons'),
  getLesson: (id) => api.get(`/lessons/${id}`),
  getLessonsByLevel: (level) => api.get(`/lessons?level=${level}`),
};

export const progressService = {
  getUserProgress: async (userId) => {
    // Fetch user progress from the API
    const response = await api.get(`/progress/${userId}`);
    return response.data || {
      totalXp: 0,
      streak: 0,
      level: 1,
      badges: [],
      completedLessons: [],
      currentLesson: 1,
      lastLoginDate: null
    };
  },
  updateProgress: async (userId, updates) => {
    // Save progress to backend/database
    return api.post(`/progress/${userId}`, updates);
  }
};

export const streakService = {
  getStreak: (userId) => api.get(`/streaks/${userId}`),
  updateStreak: (userId) => api.post(`/streaks/${userId}/update`),
};

export const leaderboardService = {
  getGlobalLeaderboard: () => api.get('/leaderboard/global'),
  getUserRank: (userId) => api.get(`/leaderboard/rank/${userId}`),
};

export default api;