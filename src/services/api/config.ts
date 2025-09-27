import AsyncStorage from '@react-native-async-storage/async-storage';

// API 기본 설정
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3001' : 'https://api.cheonmabigo.com',
  TIMEOUT: 10000,
};

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',

  // 예산
  BUDGETS: '/api/budgets',
  BUDGET_BY_ID: (id: string) => `/api/budgets/${id}`,

  // 거래내역
  TRANSACTIONS: '/api/transactions',
  TRANSACTION_BY_ID: (id: string) => `/api/transactions/${id}`,
  TRANSACTIONS_STATS: '/api/transactions/stats',

  // 목표
  GOALS: '/api/goals',
  GOAL_BY_ID: (id: string) => `/api/goals/${id}`,
};

// 토큰 관리
export const TOKEN_STORAGE = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',

  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.REFRESH_TOKEN);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(this.ACCESS_TOKEN, accessToken),
      AsyncStorage.setItem(this.REFRESH_TOKEN, refreshToken),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(this.ACCESS_TOKEN),
      AsyncStorage.removeItem(this.REFRESH_TOKEN),
    ]);
  },
};

// API 요청 헤더
export const getAuthHeaders = async () => {
  const token = await TOKEN_STORAGE.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};