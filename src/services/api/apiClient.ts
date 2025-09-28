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
  private retryQueue: Array<{ resolve: Function; reject: Function }> = [];
  private isRefreshing = false;
  private maxRetries = 3;
  private retryDelay = 1000;

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

    // Response interceptor to handle token refresh and retries
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.retryQueue.push({ resolve, reject });
            });
          }

          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Process retry queue
              this.retryQueue.forEach(({ resolve }) => {
                resolve(this.instance(originalRequest));
              });
              this.retryQueue = [];

              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            this.retryQueue.forEach(({ reject }) => {
              reject(refreshError);
            });
            this.retryQueue = [];
            await this.logout();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle network errors and 429 (rate limit) with retry
        if (this.shouldRetry(error) && !originalRequest._retryCount) {
          return this.retryRequest(originalRequest, error);
        }

        return Promise.reject(this.formatError(error));
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

  private shouldRetry(error: AxiosError): boolean {
    // Network errors (no response)
    if (!error.response) {
      return true;
    }

    // Rate limiting (429) or temporary server errors (500-503)
    const status = error.response.status;
    return status === 429 || (status >= 500 && status <= 503);
  }

  private async retryRequest(originalRequest: any, error: AxiosError): Promise<any> {
    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

    if (originalRequest._retryCount >= this.maxRetries) {
      throw this.formatError(error);
    }

    // Calculate delay with exponential backoff
    const delay = this.retryDelay * Math.pow(2, originalRequest._retryCount - 1);

    await this.sleep(delay);

    return this.instance(originalRequest);
  }

  private formatError(error: AxiosError): Error {
    if (!error.response) {
      return new Error('네트워크 오류가 발생했습니다.');
    }

    const response = error.response;

    // Try to parse error from response
    try {
      const errorData = response.data as any;
      if (errorData && typeof errorData === 'object') {
        if (errorData.error?.message) {
          return new Error(errorData.error.message);
        }
        if (errorData.message) {
          return new Error(errorData.message);
        }
      }
    } catch (e) {
      // If parsing fails, continue to default message
    }

    // Default error messages based on status
    switch (response.status) {
      case 400:
        return new Error('잘못된 요청입니다.');
      case 401:
        return new Error('인증에 실패했습니다.');
      case 403:
        return new Error('권한이 없습니다.');
      case 404:
        return new Error('요청한 리소스를 찾을 수 없습니다.');
      case 429:
        return new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      case 500:
        return new Error('서버 내부 오류가 발생했습니다.');
      case 502:
        return new Error('서버에 연결할 수 없습니다.');
      case 503:
        return new Error('서비스를 사용할 수 없습니다.');
      default:
        return new Error(`서버 오류가 발생했습니다. (${response.status})`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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