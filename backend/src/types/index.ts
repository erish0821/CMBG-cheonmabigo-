import { Request } from 'express';

// API 응답 표준 형식
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

// 인증된 요청 타입
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
}

// 페이지네이션 타입
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// 인증 관련 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

// 거래 내역 타입 (프론트엔드와 동일)
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  date: Date;
  isIncome: boolean;
  location?: string;
  paymentMethod?: string;
  aiConfidence?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 예산 타입
export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// AI 인사이트 타입
export interface AIInsight {
  id: string;
  userId: string;
  type: 'warning' | 'tip' | 'achievement' | 'prediction';
  title: string;
  description: string;
  priority: number;
  expiresAt?: Date;
  createdAt: Date;
}

// 분석 관련 타입
export interface MonthlyTrend {
  month: string;
  totalSpent: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface WeeklyPattern {
  dayOfWeek: number;
  dayName: string;
  averageSpent: number;
  transactionCount: number;
  topCategory: string;
}

export interface AnalyticsData {
  summary: {
    totalSpent: number;
    totalIncome: number;
    netAmount: number;
    transactionCount: number;
    averagePerTransaction: number;
    categoryBreakdown: CategoryBreakdown[];
  };
  monthlyTrends: MonthlyTrend[];
  weeklyPatterns: WeeklyPattern[];
  budgetAnalysis: any[];
  insights: AIInsight[];
  categoryTrends: any[];
}

// JWT 페이로드 타입
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// AI 서버 응답 타입
export interface AIParseResponse {
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  confidence: number;
  isIncome: boolean;
  extractedData: {
    location?: string;
    paymentMethod?: string;
    date?: string;
  };
}