// 타입 내보내기
export * from './navigation';
export * from './chat';
export * from './ai';
export * from './voice';

// 공통 타입 정의
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 타입
export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  currency: 'KRW' | 'USD' | 'EUR';
  language: 'ko' | 'en';
}

// 거래 타입
export interface Transaction extends BaseEntity {
  title: string;
  amount: number;
  category: string;
  date: Date;
  location?: string;
  memo?: string;
  tags: string[];
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
}

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'bank-transfer'
  | 'digital-wallet';

// 카테고리 타입
export interface Category extends BaseEntity {
  name: string;
  icon: string;
  color: string;
  budget?: number;
  isDefault: boolean;
}

// 목표 타입
export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

// 예산 타입
export interface Budget extends BaseEntity {
  name: string;
  totalAmount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  categories: CategoryBudget[];
  startDate: Date;
  endDate: Date;
}

export interface CategoryBudget {
  categoryId: string;
  amount: number;
  spent: number;
}

// AI 분석 타입
export interface AIInsight extends BaseEntity {
  type: 'warning' | 'suggestion' | 'achievement' | 'trend';
  title: string;
  description: string;
  data: Record<string, any>;
  priority: number;
  isRead: boolean;
}

// 채팅 메시지 타입
export interface ChatMessage extends BaseEntity {
  text: string;
  isUser: boolean;
  type: 'text' | 'transaction' | 'insight' | 'suggestion';
  metadata?: Record<string, any>;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 타입
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 폼 상태 타입
export interface FormState<T = any> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// 로딩 상태 타입
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// 설정 타입
export interface AppSettings {
  notifications: {
    push: boolean;
    email: boolean;
    weeklyReport: boolean;
    budgetAlerts: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    dataSharing: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    reduceMotion: boolean;
  };
}
