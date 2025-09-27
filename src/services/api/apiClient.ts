import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'
  : 'https://your-production-api.com/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

class ApiClient {
  private instance: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            await this.logout();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data.data;

        await AsyncStorage.setItem('access_token', access_token);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refresh_token', newRefreshToken);
        }

        return access_token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        await this.logout();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async logout() {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
    // Navigation to login screen should be handled by the auth store
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.get(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.put(url, data);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.patch(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.delete(url);
    return response.data;
  }

  // Upload file with progress tracking
  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(Math.round(progress));
        }
      },
    });
    return response.data;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return false;

      // Optionally verify token with server
      await this.get('/auth/me');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<any> {
    try {
      const response = await this.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '/health')}`, {
        timeout: 5000,
      });
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;