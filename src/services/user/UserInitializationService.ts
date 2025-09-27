import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../api/authService';
import { BudgetService } from '../budget/BudgetService';

// 사용자 기본 설정 인터페이스
export interface UserDefaultSettings {
  monthlyBudget: number;
  savingsGoal: number;
  currency: string;
  language: string;
  notifications: {
    dailyReminder: boolean;
    budgetAlert: boolean;
    goalProgress: boolean;
  };
  categories: {
    enabled: string[];
    prioritized: string[];
  };
  spendingLimits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// 사용자 기본 상태
export interface UserProfile {
  user: User;
  settings: UserDefaultSettings;
  isFirstTime: boolean;
  onboardingCompleted: boolean;
  dataInitialized: boolean;
  lastActiveDate: string;
}

export class UserInitializationService {
  private static readonly STORAGE_KEYS = {
    USER_PROFILE: 'user_profile',
    DEFAULT_SETTINGS: 'default_settings',
    INITIALIZATION_STATUS: 'initialization_status',
    ONBOARDING_STATUS: 'onboarding_status',
  };

  /**
   * 새 사용자 프로필 초기화
   */
  static async initializeNewUser(user: User): Promise<UserProfile> {
    try {
      const defaultSettings = this.getDefaultSettings();

      const userProfile: UserProfile = {
        user,
        settings: defaultSettings,
        isFirstTime: true,
        onboardingCompleted: false,
        dataInitialized: false,
        lastActiveDate: new Date().toISOString(),
      };

      // 사용자 프로필 저장
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(userProfile)
      );

      // 초기화 상태 저장
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.INITIALIZATION_STATUS,
        JSON.stringify({
          userId: user.id,
          initializedAt: new Date().toISOString(),
          version: '1.0.0',
        })
      );

      console.log('새 사용자 프로필 초기화 완료:', user.email);
      return userProfile;
    } catch (error) {
      console.error('사용자 초기화 실패:', error);
      throw new Error('사용자 프로필 초기화에 실패했습니다.');
    }
  }

  /**
   * 기존 사용자 프로필 로드
   */
  static async loadUserProfile(user: User): Promise<UserProfile> {
    try {
      const storedProfile = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PROFILE);

      if (storedProfile) {
        const profile: UserProfile = JSON.parse(storedProfile);

        // 사용자 정보 업데이트
        profile.user = user;
        profile.lastActiveDate = new Date().toISOString();

        // 업데이트된 프로필 저장
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_PROFILE,
          JSON.stringify(profile)
        );

        return profile;
      } else {
        // 프로필이 없으면 새로 초기화
        return await this.initializeNewUser(user);
      }
    } catch (error) {
      console.error('사용자 프로필 로드 실패:', error);
      // 에러 시 새로 초기화
      return await this.initializeNewUser(user);
    }
  }

  /**
   * 기본 설정 가져오기
   */
  private static getDefaultSettings(): UserDefaultSettings {
    return {
      monthlyBudget: 1000000, // 기본 100만원
      savingsGoal: 200000,    // 기본 20만원 저축
      currency: 'KRW',
      language: 'ko',
      notifications: {
        dailyReminder: true,
        budgetAlert: true,
        goalProgress: true,
      },
      categories: {
        enabled: [
          'food', 'transport', 'shopping', 'entertainment',
          'health', 'education', 'utilities', 'others'
        ],
        prioritized: ['food', 'transport', 'utilities'],
      },
      spendingLimits: {
        daily: 33000,   // 월 100만원 기준 하루 약 3만3천원
        weekly: 230000, // 주 23만원
        monthly: 1000000,
      },
    };
  }

  /**
   * 온보딩 완료 처리
   */
  static async completeOnboarding(userId: number): Promise<void> {
    try {
      const profileData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PROFILE);

      if (profileData) {
        const profile: UserProfile = JSON.parse(profileData);
        profile.onboardingCompleted = true;
        profile.isFirstTime = false;

        await AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_PROFILE,
          JSON.stringify(profile)
        );
      }

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.ONBOARDING_STATUS,
        JSON.stringify({
          userId,
          completedAt: new Date().toISOString(),
        })
      );

      console.log('온보딩 완료 처리됨:', userId);
    } catch (error) {
      console.error('온보딩 완료 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 데이터 초기화 완료 처리
   */
  static async completeDataInitialization(userId: number): Promise<void> {
    try {
      // 기본 예산 생성
      await BudgetService.createDefaultBudgets(userId);

      const profileData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PROFILE);

      if (profileData) {
        const profile: UserProfile = JSON.parse(profileData);
        profile.dataInitialized = true;

        await AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_PROFILE,
          JSON.stringify(profile)
        );
      }

      console.log('데이터 초기화 완료 처리됨:', userId);
    } catch (error) {
      console.error('데이터 초기화 완료 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 설정 업데이트
   */
  static async updateUserSettings(
    userId: number,
    updates: Partial<UserDefaultSettings>
  ): Promise<void> {
    try {
      const profileData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PROFILE);

      if (profileData) {
        const profile: UserProfile = JSON.parse(profileData);
        profile.settings = { ...profile.settings, ...updates };

        await AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_PROFILE,
          JSON.stringify(profile)
        );

        console.log('사용자 설정 업데이트 완료:', userId);
      }
    } catch (error) {
      console.error('사용자 설정 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 현재 사용자 프로필 조회
   */
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PROFILE);

      if (profileData) {
        return JSON.parse(profileData);
      }

      return null;
    } catch (error) {
      console.error('사용자 프로필 조회 실패:', error);
      return null;
    }
  }

  /**
   * 사용자 데이터 초기화 (로그아웃 시)
   */
  static async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.USER_PROFILE,
        this.STORAGE_KEYS.DEFAULT_SETTINGS,
        this.STORAGE_KEYS.INITIALIZATION_STATUS,
        this.STORAGE_KEYS.ONBOARDING_STATUS,
      ]);

      console.log('사용자 데이터 초기화 완료');
    } catch (error) {
      console.error('사용자 데이터 초기화 실패:', error);
    }
  }

  /**
   * 첫 사용자 여부 확인
   */
  static async isFirstTimeUser(userId: number): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();
      return profile?.isFirstTime ?? true;
    } catch (error) {
      console.error('첫 사용자 확인 실패:', error);
      return true; // 에러 시 첫 사용자로 간주
    }
  }

  /**
   * 온보딩 완료 여부 확인
   */
  static async isOnboardingCompleted(userId: number): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();
      return profile?.onboardingCompleted ?? false;
    } catch (error) {
      console.error('온보딩 상태 확인 실패:', error);
      return false;
    }
  }

  /**
   * 일일 권장 지출 계산
   */
  static calculateDailyRecommendedSpending(
    monthlyBudget: number,
    currentDate: Date = new Date()
  ): number {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const daysPassed = currentDate.getDate() - 1;
    const remainingDays = daysInMonth - daysPassed;

    if (remainingDays <= 0) {
      return 0;
    }

    return Math.floor(monthlyBudget / remainingDays);
  }

  /**
   * 예산 진행률 계산
   */
  static calculateBudgetProgress(
    spent: number,
    budget: number,
    currentDate: Date = new Date()
  ): {
    percentage: number;
    status: 'good' | 'warning' | 'over';
    remainingBudget: number;
    dailyRecommended: number;
  } {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const remainingBudget = Math.max(0, budget - spent);
    const dailyRecommended = this.calculateDailyRecommendedSpending(remainingBudget, currentDate);

    let status: 'good' | 'warning' | 'over';
    if (percentage <= 70) {
      status = 'good';
    } else if (percentage <= 100) {
      status = 'warning';
    } else {
      status = 'over';
    }

    return {
      percentage: Math.round(percentage),
      status,
      remainingBudget,
      dailyRecommended,
    };
  }
}