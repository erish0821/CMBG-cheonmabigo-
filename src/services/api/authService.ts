import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ ? 'http://localhost:3001' : 'https://api.cheonmabigo.com';

export interface User {
  id: number;
  email: string;
  name: string;
  phone_number?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  is_active: boolean;
  email_verified: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  login_count: number;
  preferences?: any;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone_number?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  preferences?: any;
  timezone?: string;
  language?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

class AuthService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  }

  private async storeTokens(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
    await AsyncStorage.multiSet([
      ['access_token', tokens.accessToken],
      ['refresh_token', tokens.refreshToken],
    ]);
  }

  private async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
  }

  // 회원가입
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success && response.data) {
        await this.storeTokens(response.data.tokens);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
        return response.data;
      }

      throw new Error(response.error?.message || '회원가입에 실패했습니다');
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.message || '회원가입 중 오류가 발생했습니다');
    }
  }

  // 로그인
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data) {
        await this.storeTokens(response.data.tokens);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
        return response.data;
      }

      throw new Error(response.error?.message || '로그인에 실패했습니다');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || '로그인 중 오류가 발생했습니다');
    }
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.makeRequest<{ user: User }>('/api/auth/me');

      if (response.success && response.data) {
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
        return response.data.user;
      }

      throw new Error(response.error?.message || '사용자 정보를 가져올 수 없습니다');
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw new Error(error.message || '사용자 정보 조회 중 오류가 발생했습니다');
    }
  }

  // 사용자 프로필 업데이트
  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    try {
      const response = await this.makeRequest<{ user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (response.success && response.data) {
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
        return response.data.user;
      }

      throw new Error(response.error?.message || '프로필 업데이트에 실패했습니다');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || '프로필 업데이트 중 오류가 발생했습니다');
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await this.makeRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  // 토큰 갱신
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다');
      }

      const response = await this.makeRequest<{ accessToken: string }>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success && response.data) {
        await AsyncStorage.setItem('access_token', response.data.accessToken);
        return response.data.accessToken;
      }

      throw new Error(response.error?.message || '토큰 갱신에 실패했습니다');
    } catch (error: any) {
      console.error('Token refresh error:', error);
      await this.clearTokens();
      throw new Error('토큰이 만료되었습니다. 다시 로그인해주세요');
    }
  }

  // 인증 상태 확인
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return false;

      await this.getCurrentUser();
      return true;
    } catch (error) {
      try {
        await this.refreshToken();
        return true;
      } catch (refreshError) {
        await this.clearTokens();
        return false;
      }
    }
  }

  // 저장된 사용자 정보 가져오기
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // 액세스 토큰 가져오기
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;