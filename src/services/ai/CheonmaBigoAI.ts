import {
  AIResponse,
  UserContext,
  ExaoneConfig,
  MessageIntent,
  ExtractedTransaction,
  AIServiceState,
  AIMetrics,
} from '../../types/ai';
import { Transaction, CategoryType, PaymentMethod } from '../../types/transaction';
import { ExaoneService } from './ExaoneService';
import { PromptManager } from './PromptManager';
import { ResponseParser } from './ResponseParser';
import { IntentClassifier } from './IntentClassifier';
import { AIOptimizer } from './AIOptimizer';

/**
 * 천마비고 통합 AI 서비스
 * 모든 AI 기능을 하나로 통합한 메인 클래스
 */
export class CheonmaBigoAI {
  private exaoneService: ExaoneService;
  private promptManager: PromptManager;
  private responseParser: ResponseParser;
  private intentClassifier: IntentClassifier;
  private optimizer: AIOptimizer;

  private isInitialized = false;
  private currentSessionId?: string;

  constructor(config?: Partial<ExaoneConfig>) {
    this.exaoneService = new ExaoneService(config);
    this.promptManager = new PromptManager();
    this.responseParser = new ResponseParser();
    this.intentClassifier = new IntentClassifier();
    this.optimizer = new AIOptimizer();
  }

  /**
   * AI 서비스 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 각 서비스 초기화 확인
      const state = this.exaoneService.getServiceState();

      while (!state.isInitialized) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.isInitialized = true;
      console.log('천마비고 AI 서비스가 성공적으로 초기화되었습니다.');
    } catch (error) {
      console.error('AI 서비스 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 메인 메시지 처리 메소드
   */
  async processMessage(
    userInput: string,
    userContext?: UserContext,
    sessionId?: string
  ): Promise<{
    response: AIResponse;
    extractedTransaction?: Transaction;
    intent: MessageIntent;
    confidence: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      // 1. 세션 관리
      if (sessionId) {
        this.currentSessionId = sessionId;
      }

      // 2. 캐시 확인
      const cachedResponse = this.optimizer.getCachedResponse(
        userInput,
        userContext
      );
      if (cachedResponse) {
        return {
          response: cachedResponse,
          intent: cachedResponse.intent,
          confidence: cachedResponse.confidence,
        };
      }

      // 3. 의도 분류
      const intentResult = this.intentClassifier.classifyIntent(userInput);

      // 4. 캐시 전략 적용
      const cacheStrategy = this.optimizer.getCacheStrategy(
        intentResult.intent
      );

      // 5. AI 모델 처리
      const aiResponse = await this.exaoneService.processMessage(
        userInput,
        userContext,
        sessionId
      );

      // 6. 거래 정보 추출 (필요한 경우)
      let extractedTransaction: Transaction | undefined;
      if (
        intentResult.intent === 'transaction_record' &&
        aiResponse.extractedData?.transaction
      ) {
        extractedTransaction = this.convertToTransaction(
          aiResponse.extractedData.transaction
        );
      }

      // 7. 응답 캐싱 (전략에 따라)
      if (cacheStrategy.shouldCache) {
        this.optimizer.cacheResponse(userInput, aiResponse, userContext);
      }

      // 8. 메트릭 업데이트
      const responseTime = Date.now() - startTime;
      this.optimizer.updateMetrics(
        responseTime,
        aiResponse.metadata.tokensUsed,
        true
      );

      return {
        response: aiResponse,
        extractedTransaction,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
      };
    } catch (error) {
      console.error('메시지 처리 오류:', error);

      const responseTime = Date.now() - startTime;
      this.optimizer.updateMetrics(responseTime, 0, false);

      // 에러 응답 생성
      const errorResponse: AIResponse = {
        id: `error_${Date.now()}`,
        content:
          '죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.',
        intent: 'unknown',
        confidence: 0,
        suggestions: ['다시 시도하기', '다른 방식으로 말해보기'],
        metadata: {
          tokensUsed: 0,
          responseTime: Date.now(),
          modelVersion: 'EXAONE-3.5-7.8B',
        },
      };

      return {
        response: errorResponse,
        intent: 'unknown',
        confidence: 0,
      };
    }
  }

  /**
   * 거래 기록 전용 메소드
   */
  async recordTransaction(
    userInput: string,
    userContext?: UserContext
  ): Promise<{
    response: AIResponse;
    transaction?: Transaction;
    success: boolean;
  }> {
    try {
      const result = await this.processMessage(userInput, userContext);

      if (
        result.intent === 'transaction_record' &&
        result.extractedTransaction
      ) {
        return {
          response: result.response,
          transaction: result.extractedTransaction,
          success: true,
        };
      }

      return {
        response: result.response,
        success: false,
      };
    } catch (error) {
      console.error('거래 기록 오류:', error);
      return {
        response: {
          id: `error_${Date.now()}`,
          content: '거래 기록에 실패했습니다. 다시 시도해 주세요.',
          intent: 'transaction_record',
          confidence: 0,
          metadata: {
            tokensUsed: 0,
            responseTime: Date.now(),
            modelVersion: 'EXAONE-3.5-7.8B',
          },
        },
        success: false,
      };
    }
  }

  /**
   * 재정 조언 전용 메소드
   */
  async getFinancialAdvice(
    question: string,
    userContext: UserContext
  ): Promise<{
    response: AIResponse;
    suggestions: string[];
  }> {
    try {
      const result = await this.processMessage(question, userContext);

      return {
        response: result.response,
        suggestions: result.response.suggestions || [],
      };
    } catch (error) {
      console.error('재정 조언 요청 오류:', error);
      return {
        response: {
          id: `error_${Date.now()}`,
          content: '재정 조언을 제공할 수 없습니다. 다시 시도해 주세요.',
          intent: 'financial_advice',
          confidence: 0,
          metadata: {
            tokensUsed: 0,
            responseTime: Date.now(),
            modelVersion: 'EXAONE-3.5-7.8B',
          },
        },
        suggestions: ['다시 시도하기', '구체적으로 질문하기'],
      };
    }
  }

  /**
   * 지출 분석 전용 메소드
   */
  async analyzeSpending(
    analysisRequest: string,
    userContext: UserContext
  ): Promise<{
    response: AIResponse;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const result = await this.processMessage(analysisRequest, userContext);

      // 응답에서 인사이트와 추천사항 추출
      let insights: string[] = [];
      let recommendations: string[] = [];

      if (result.response.extractedData?.analysis) {
        // 구조화된 분석 데이터가 있는 경우
        insights = ['분석이 완료되었습니다.'];
        recommendations = result.response.suggestions || [];
      } else {
        // 텍스트 응답에서 추출
        const content = result.response.content;
        insights = this.extractInsightsFromText(content);
        recommendations = result.response.suggestions || [];
      }

      return {
        response: result.response,
        insights,
        recommendations,
      };
    } catch (error) {
      console.error('지출 분석 오류:', error);
      return {
        response: {
          id: `error_${Date.now()}`,
          content:
            '지출 분석을 수행할 수 없습니다. 데이터를 확인하고 다시 시도해 주세요.',
          intent: 'spending_analysis',
          confidence: 0,
          metadata: {
            tokensUsed: 0,
            responseTime: Date.now(),
            modelVersion: 'EXAONE-3.5-7.8B',
          },
        },
        insights: [],
        recommendations: ['거래 데이터 확인하기', '다시 시도하기'],
      };
    }
  }

  /**
   * 빠른 응답 생성 (캐시 우선)
   */
  async getQuickResponse(
    userInput: string,
    userContext?: UserContext
  ): Promise<AIResponse> {
    // 캐시 확인
    const cachedResponse = this.optimizer.getCachedResponse(
      userInput,
      userContext
    );
    if (cachedResponse) {
      return cachedResponse;
    }

    // 간단한 패턴 매칭 응답
    return this.generatePatternResponse(userInput);
  }

  /**
   * 유사한 질문 검색
   */
  findSimilarQuestions(query: string): Array<{
    question: string;
    response: string;
    similarity: number;
  }> {
    const similar = this.optimizer.findSimilarQuestions(query, 0.7);

    return similar.map(cached => ({
      question: cached.query,
      response: cached.response.content,
      similarity: 0.8, // 실제로는 계산된 유사도
    }));
  }

  /**
   * 서비스 상태 조회
   */
  getServiceStatus(): {
    isInitialized: boolean;
    serviceState: AIServiceState;
    metrics: AIMetrics;
    cacheStats: any;
  } {
    return {
      isInitialized: this.isInitialized,
      serviceState: this.exaoneService.getServiceState(),
      metrics: this.optimizer.getMetrics(),
      cacheStats: this.optimizer.getCacheStats(),
    };
  }

  /**
   * 캐시 및 메트릭 관리
   */
  async clearCache(): Promise<void> {
    await this.optimizer.clearCache();
    await this.exaoneService.clearCache();
  }

  async resetMetrics(): Promise<void> {
    await this.optimizer.resetMetrics();
    await this.exaoneService.resetMetrics();
  }

  /**
   * 프라이빗 헬퍼 메소드들
   */
  private convertToTransaction(extracted: any): Transaction {
    return {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: extracted.description || '지출',
      amount: extracted.amount,
      category: extracted.category || CategoryType.OTHER,
      subcategory: extracted.subcategory,
      date: extracted.date || new Date(),
      paymentMethod: this.mapPaymentMethod(extracted.paymentMethod),
      location: extracted.location,
      isIncome: extracted.isIncome || false,
      tags: [],
      confidence: extracted.confidence || 0.7,
      originalText: extracted.originalText || '',
      aiParsed: true,
      userModified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private mapPaymentMethod(method?: string): PaymentMethod {
    const mapping: Record<string, PaymentMethod> = {
      카드: PaymentMethod.CARD,
      현금: PaymentMethod.CASH,
      계좌이체: PaymentMethod.TRANSFER,
      모바일페이: PaymentMethod.MOBILE_PAY,
    };

    return mapping[method || ''] || PaymentMethod.CARD;
  }

  private extractInsightsFromText(text: string): string[] {
    const insights: string[] = [];

    // 간단한 패턴 매칭으로 인사이트 추출
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);

    sentences.forEach(sentence => {
      if (
        sentence.includes('분석') ||
        sentence.includes('패턴') ||
        sentence.includes('트렌드')
      ) {
        insights.push(sentence.trim());
      }
    });

    return insights.length > 0 ? insights : ['분석 결과를 확인했습니다.'];
  }

  private generatePatternResponse(userInput: string): AIResponse {
    const lowerInput = userInput.toLowerCase();

    let content =
      '안녕하세요! 천마비고입니다. 재정 관리에 대해 무엇이든 물어보세요.';
    let intent: MessageIntent = 'general_question';

    if (lowerInput.includes('안녕')) {
      content =
        '안녕하세요! 천마비고입니다. 오늘은 어떤 도움이 필요하신가요? 😊';
      intent = 'greeting';
    } else if (lowerInput.includes('고마워') || lowerInput.includes('감사')) {
      content =
        '천만에요! 언제든지 재정 관리에 대해 도움이 필요하시면 말씀해 주세요! 💰';
    } else if (lowerInput.includes('도움')) {
      content =
        '제가 도와드릴 수 있는 것들이 많아요! 지출 기록, 예산 계획, 저축 목표 설정, 재정 조언 등이 가능합니다.';
    }

    return {
      id: `pattern_${Date.now()}`,
      content,
      intent,
      confidence: 0.6,
      suggestions: [
        '오늘 지출 기록하기',
        '이번 달 현황 보기',
        '절약 팁 알아보기',
      ],
      metadata: {
        tokensUsed: content.length,
        responseTime: Date.now(),
        modelVersion: 'Pattern-Matching',
      },
    };
  }
}

// 싱글톤 인스턴스
export const cheonmaBigoAI = new CheonmaBigoAI();
