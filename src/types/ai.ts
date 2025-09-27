// AI 모델 및 서비스 관련 타입 정의

import { Transaction } from './index';

// AI 모델 설정
export interface ExaoneConfig {
  modelName: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  contextWindow: number;
  apiUrl?: string;
  apiKey?: string;
}

// AI 메시지 타입
export interface AIMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// AI 응답 타입
export interface AIResponse {
  id: string;
  content: string;
  intent: MessageIntent;
  confidence: number;
  extractedData?: ExtractedData;
  suggestions?: string[];
  metadata: {
    tokensUsed: number;
    responseTime: number;
    modelVersion: string;
  };
}

// 메시지 의도 분류
export type MessageIntent =
  | 'transaction_record' // 거래 기록
  | 'financial_advice' // 재정 조언
  | 'goal_setting' // 목표 설정
  | 'spending_analysis' // 지출 분석
  | 'general_question' // 일반 질문
  | 'greeting' // 인사
  | 'unknown'; // 알 수 없음

// 추출된 데이터 타입
export interface ExtractedData {
  transaction?: ExtractedTransaction;
  goal?: ExtractedGoal;
  analysis?: ExtractedAnalysis;
}

// 추출된 거래 정보
export interface ExtractedTransaction {
  amount: number;
  description: string;
  category?: string;
  location?: string;
  paymentMethod?: string;
  date?: Date;
  type: 'income' | 'expense';
}

// 추출된 목표 정보
export interface ExtractedGoal {
  title: string;
  targetAmount: number;
  targetDate?: Date;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

// 추출된 분석 요청
export interface ExtractedAnalysis {
  period?: 'week' | 'month' | 'year';
  category?: string;
  type?: 'spending' | 'income' | 'budget' | 'trend';
}

// 사용자 컨텍스트
export interface UserContext {
  userId: string;
  recentTransactions: Transaction[];
  monthlyBudget?: number;
  savingsGoals: any[];
  spendingPatterns: SpendingPattern[];
  preferences: UserPreferences;
}

// 지출 패턴
export interface SpendingPattern {
  category: string;
  averageAmount: number;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// 사용자 선호도 (AI 관련)
export interface UserPreferences {
  responseStyle: 'formal' | 'casual' | 'friendly';
  adviceLevel: 'basic' | 'detailed' | 'expert';
  notificationFrequency: 'high' | 'medium' | 'low';
  language: 'ko' | 'en';
}

// 프롬프트 템플릿
export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category: 'transaction' | 'advice' | 'analysis' | 'goal';
}

// AI 서비스 상태
export interface AIServiceState {
  isInitialized: boolean;
  isProcessing: boolean;
  lastRequestTime?: Date;
  errorCount: number;
  modelLoaded: boolean;
  cacheSize: number;
}

// 캐시된 응답
export interface CachedResponse {
  id: string;
  query: string;
  response: AIResponse;
  timestamp: Date;
  expiresAt: Date;
  hitCount: number;
}

// AI 에러 타입
export interface AIError {
  code:
    | 'NETWORK_ERROR'
    | 'MODEL_ERROR'
    | 'PARSING_ERROR'
    | 'RATE_LIMIT'
    | 'UNKNOWN';
  message: string;
  details?: any;
  timestamp: Date;
}

// 성능 메트릭
export interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  cacheHitRate: number;
  errorRate: number;
}

// 한국어 특화 설정
export interface KoreanNLPConfig {
  enableKoreanTokenizer: boolean;
  handleHonorific: boolean;
  currencyFormats: string[];
  dateFormats: string[];
  locationKeywords: string[];
  paymentMethodKeywords: string[];
}

// 거래 엔티티 추출 결과
export interface EntityExtractionResult {
  entities: {
    amount: number | null;
    merchant: string | null;
    category: string | null;
    location: string | null;
    paymentMethod: string | null;
    date: Date | null;
  };
  confidence: {
    amount: number;
    merchant: number;
    category: number;
    location: number;
    paymentMethod: number;
    date: number;
  };
}

// 감정 분석 결과
export interface SentimentAnalysis {
  score: number; // -1 (매우 부정) ~ 1 (매우 긍정)
  confidence: number;
  emotion: 'happy' | 'neutral' | 'worried' | 'excited' | 'frustrated';
}

// 대화 세션
export interface ConversationSession {
  id: string;
  userId: string;
  messages: AIMessage[];
  context: UserContext;
  startTime: Date;
  lastActivity: Date;
  metadata: {
    totalTokensUsed: number;
    messageCount: number;
    averageResponseTime: number;
  };
}
