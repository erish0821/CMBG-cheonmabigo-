/**
 * 거래 관련 타입 정의
 * 8단계: AsyncStorage 기반 간단한 구조
 */

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: CategoryType;
  subcategory?: string;
  date: Date;
  paymentMethod: PaymentMethod;
  location?: string;
  isIncome: boolean;
  tags: string[];
  confidence: number; // AI 분류 신뢰도 (0-1)
  userId?: string; // 나중에 인증 시스템에서 사용
  createdAt: Date;
  updatedAt: Date;

  // AI 파싱 관련
  originalText: string; // 사용자가 입력한 원본 텍스트
  aiParsed: boolean; // AI로 파싱되었는지 여부
  userModified: boolean; // 사용자가 수정했는지 여부
}

export enum CategoryType {
  FOOD = 'food',                    // 식비
  TRANSPORT = 'transport',          // 교통비
  ENTERTAINMENT = 'entertainment',  // 문화생활
  SHOPPING = 'shopping',           // 쇼핑
  HEALTHCARE = 'healthcare',       // 의료
  EDUCATION = 'education',         // 교육
  UTILITIES = 'utilities',         // 공과금
  HOUSING = 'housing',             // 주거비
  INCOME = 'income',               // 수입
  OTHER = 'other'                  // 기타
}

export enum PaymentMethod {
  CASH = 'cash',           // 현금
  CARD = 'card',          // 카드
  TRANSFER = 'transfer',   // 계좌이체
  MOBILE_PAY = 'mobile_pay' // 모바일페이
}

export interface CategoryInfo {
  type: CategoryType;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
  keywords: string[];
  averageAmount?: number; // 평균 금액 (분류 시 참고)
}

export interface ParsedTransaction {
  amount: number;
  description: string;
  category: CategoryType;
  subcategory?: string;
  date?: Date;
  paymentMethod: PaymentMethod;
  location?: string;
  confidence: number;
  isIncome: boolean;
  tags?: string[];
  originalText: string;
}

export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  categories?: CategoryType[];
  paymentMethods?: PaymentMethod[];
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
  isIncome?: boolean;
}

export interface TransactionSummary {
  totalSpent: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: CategorySpending[];
  topSpendingDay: Date;
  averagePerTransaction: number;
}

export interface CategorySpending {
  category: CategoryType;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageAmount: number;
}

// AsyncStorage에 저장할 때 사용하는 키
export const TRANSACTION_STORAGE_KEY = 'cheonmabigo_transactions';
export const TRANSACTION_METADATA_KEY = 'cheonmabigo_transaction_metadata';

// 메타데이터 (통계, 설정 등)
export interface TransactionMetadata {
  lastUpdated: Date;
  totalTransactions: number;
  userPreferences: {
    defaultPaymentMethod: PaymentMethod;
    favoriteCategories: CategoryType[];
    customSubcategories: Record<CategoryType, string[]>;
  };
}