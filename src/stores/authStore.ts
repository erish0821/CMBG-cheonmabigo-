import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, User, LoginRequest, RegisterRequest, AuthResponse, UpdateProfileRequest } from '../services/api/authService';
import { UserInitializationService, UserProfile } from '../services/user/UserInitializationService';

export interface AuthState {
  // 상태
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // 액션
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  updateProfile: (profileData: UpdateProfileRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initializeUserProfile: (user: User) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // 로그인
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });

    try {
      const authResponse = await authService.login(credentials);

      // 사용자 프로필 로드 또는 초기화
      await get().initializeUserProfile(authResponse.user);

      set({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || '로그인에 실패했습니다.',
      });
      throw error;
    }
  },

  // 회원가입
  register: async (userData: RegisterRequest) => {
    set({ isLoading: true, error: null });

    try {
      const authResponse = await authService.register(userData);

      // 새 사용자 프로필 초기화
      await get().initializeUserProfile(authResponse.user);

      set({
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || '회원가입에 실패했습니다.',
      });
      throw error;
    }
  },

  // 프로필 업데이트
  updateProfile: async (profileData: UpdateProfileRequest) => {
    set({ isLoading: true, error: null });

    try {
      const updatedUser = await authService.updateProfile(profileData);

      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '프로필 업데이트에 실패했습니다.',
      });
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
    } catch (error) {
      console.warn('로그아웃 API 호출 실패:', error);
    } finally {
      // 사용자 데이터 초기화
      await UserInitializationService.clearUserData();

      // API 호출 실패 여부에 관계없이 로컬 상태는 초기화
      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // 인증 상태 확인
  checkAuthStatus: async () => {
    set({ isLoading: true });

    try {
      const isAuthenticated = await authService.isAuthenticated();

      if (isAuthenticated) {
        // 저장된 사용자 정보 가져오기
        const storedUser = await authService.getStoredUser();

        if (storedUser) {
          set({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // 저장된 정보가 없으면 서버에서 다시 가져오기
          await get().refreshUser();
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('인증 상태 확인 실패:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || '인증 상태 확인에 실패했습니다.',
      });
    }
  },

  // 사용자 정보 새로고침
  refreshUser: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, error: null });
    } catch (error: any) {
      console.error('사용자 정보 새로고침 실패:', error);
      // 토큰이 만료되었을 수 있으므로 로그아웃
      await get().logout();
      throw error;
    }
  },

  // 앱 시작 시 인증 상태 초기화
  initializeAuth: async () => {
    set({ isLoading: true, isInitialized: false });

    try {
      await get().checkAuthStatus();
    } catch (error) {
      console.error('인증 초기화 실패:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  // 에러 클리어
  clearError: () => {
    set({ error: null });
  },

  // 사용자 프로필 초기화
  initializeUserProfile: async (user: User) => {
    try {
      const userProfile = await UserInitializationService.loadUserProfile(user);

      set({ userProfile });

      console.log('사용자 프로필 초기화 완료:', {
        userId: user.id,
        isFirstTime: userProfile.isFirstTime,
        onboardingCompleted: userProfile.onboardingCompleted,
      });
    } catch (error) {
      console.error('사용자 프로필 초기화 실패:', error);
      // 프로필 초기화에 실패해도 로그인은 유지
    }
  },

  // 온보딩 완료
  completeOnboarding: async () => {
    const { user, userProfile } = get();

    if (!user || !userProfile) {
      throw new Error('사용자 정보가 없습니다.');
    }

    try {
      await UserInitializationService.completeOnboarding(user.id);

      // 로컬 상태 업데이트
      const updatedProfile: UserProfile = {
        ...userProfile,
        onboardingCompleted: true,
        isFirstTime: false,
      };

      set({ userProfile: updatedProfile });

      console.log('온보딩 완료 처리됨:', user.id);
    } catch (error) {
      console.error('온보딩 완료 처리 실패:', error);
      throw error;
    }
  },
}));

// 앱 시작 시 자동으로 인증 상태 초기화
useAuthStore.getState().initializeAuth();