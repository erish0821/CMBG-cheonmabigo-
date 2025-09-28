// Python LLM 서버 기반 AI 응답 시스템
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ExaoneConfig,
  AIResponse,
  UserContext,
  AIServiceState,
  CachedResponse,
  AIError,
  AIMetrics,
  ConversationSession,
  AIMessage,
  MessageIntent,
} from '../../types/ai';
import { PromptManager } from './PromptManager';
import { ResponseParser } from './ResponseParser';
import { pythonLLMService } from './PythonLLMService';

/**
 * LGAI EXAONE 3.5 7.8B 모델 통합 서비스
 * Python LLM 서버 기반 한국어 특화 개인 재정 관리 AI
 */
export class ExaoneService {
  private config: ExaoneConfig;
  private promptManager: PromptManager;
  private responseParser: ResponseParser;
  private state: AIServiceState;
  private metrics: AIMetrics;
  private cache: Map<string, CachedResponse> = new Map();
  private currentSession?: ConversationSession;

  constructor(config?: Partial<ExaoneConfig>) {
    this.config = {
      modelName:
        process.env.EXPO_PUBLIC_EXAONE_MODEL ||
        'LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct',
      maxTokens: 512,
      temperature: 0.7,
      systemPrompt: '',
      contextWindow: 4096,
      apiUrl:
        'https://api-inference.huggingface.co/models/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct',
      apiKey: process.env.EXPO_PUBLIC_HF_TOKEN || process.env.HF_TOKEN || '',
      ...config,
    };

    console.log('ExaoneService initialized with config:', {
      modelName: this.config.modelName,
      hasApiKey: !!this.config.apiKey,
      apiUrl: this.config.apiUrl,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });

    this.promptManager = new PromptManager();
    this.responseParser = new ResponseParser();

    this.state = {
      isInitialized: false,
      isProcessing: false,
      errorCount: 0,
      modelLoaded: false,
      cacheSize: 0,
    };

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      cacheHitRate: 0,
      errorRate: 0,
    };

    this.initialize();
  }

  /**
   * 서비스 초기화
   */
  private async initialize(): Promise<void> {
    try {
      // 캐시 로드
      await this.loadCache();

      // 메트릭 로드
      await this.loadMetrics();

      // Python LLM 서버 연결 확인
      const isConnected = await pythonLLMService.testConnection();

      this.state.isInitialized = true;
      this.state.modelLoaded = isConnected;

      console.log(
        `ExaoneService initialized successfully. Python LLM Server: ${isConnected ? 'Connected' : 'Disconnected'}`
      );
    } catch (error) {
      console.error('ExaoneService initialization failed:', error);
      this.state.errorCount++;
    }
  }


  /**
   * 사용자 메시지 처리
   */
  async processMessage(
    userInput: string,
    userContext?: UserContext,
    sessionId?: string
  ): Promise<AIResponse> {
    if (!this.state.isInitialized) {
      throw new Error('ExaoneService not initialized');
    }

    if (this.state.isProcessing) {
      throw new Error('Another request is being processed');
    }

    const startTime = Date.now();
    this.state.isProcessing = true;
    this.state.lastRequestTime = new Date();

    try {
      // 캐시 확인
      const cachedResponse = this.getCachedResponse(userInput);
      if (cachedResponse) {
        this.metrics.totalRequests++;
        this.updateCacheHitRate();
        return cachedResponse.response;
      }

      // 세션 관리
      if (sessionId) {
        await this.loadOrCreateSession(sessionId, userContext);
      }

      // 의도 분류 및 프롬프트 생성
      const intent = this.responseParser.detectIntent
        ? this.responseParser.detectIntent(userInput)
        : this.detectBasicIntent(userInput);

      const prompt = this.generatePromptForIntent(
        userInput,
        intent,
        userContext
      );

      // AI 모델 호출
      const modelResponse = await this.callExaoneModel(prompt);

      // 응답 파싱
      const aiResponse = this.responseParser.parseResponse(
        modelResponse,
        userInput
      );

      // 세션에 메시지 추가
      if (this.currentSession) {
        this.addMessageToSession(userInput, aiResponse.content);
      }

      // 응답 캐시
      await this.cacheResponse(userInput, aiResponse);

      // 메트릭 업데이트
      this.updateMetrics(startTime, aiResponse.metadata.tokensUsed, true);

      return aiResponse;
    } catch (error) {
      console.error('Message processing error:', error);
      this.state.errorCount++;
      this.updateMetrics(startTime, 0, false);

      return this.handleError(error, userInput);
    } finally {
      this.state.isProcessing = false;
    }
  }

  /**
   * Python LLM 서버를 통한 EXAONE 3.5 7.8B 모델 호출
   */
  private async callExaoneModel(prompt: string): Promise<string> {
    try {
      console.log('Calling Python LLM Server with prompt:', prompt);

      // Python LLM 서버를 통해 AI 응답 생성
      const response = await pythonLLMService.generateChatResponse(prompt);

      console.log('Python LLM Server response received:', response);

      // Python LLM 서버의 응답 형식에 맞게 포맷팅
      return JSON.stringify({
        response: response,
        status: 'success'
      });
    } catch (error) {
      console.error('Python LLM Server call failed:', error);

      // 에러 시 기본 응답 반환
      return JSON.stringify({
        response: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        status: 'error'
      });
    }
  }

  /**
   * 의도별 프롬프트 생성
   */
  private generatePromptForIntent(
    userInput: string,
    intent: string,
    userContext?: UserContext
  ): string {
    const systemPrompt = this.promptManager.generateSystemPrompt(userContext);

    switch (intent) {
      case 'transaction_record':
        return (
          systemPrompt +
          '\n\n' +
          this.promptManager.generateTransactionPrompt(userInput)
        );

      case 'financial_advice':
        if (userContext) {
          return (
            systemPrompt +
            '\n\n' +
            this.promptManager.generateAdvicePrompt(userInput, userContext)
          );
        }
        break;

      case 'spending_analysis':
        if (userContext) {
          return (
            systemPrompt +
            '\n\n' +
            this.promptManager.generateAnalysisPrompt(userInput, userContext)
          );
        }
        break;

      case 'goal_setting':
        if (userContext) {
          return (
            systemPrompt +
            '\n\n' +
            this.promptManager.generateGoalPrompt(userInput, userContext)
          );
        }
        break;

      default:
        return (
          systemPrompt +
          '\n\n' +
          this.promptManager.generateGeneralPrompt(
            userInput,
            intent as MessageIntent
          )
        );
    }

    // 기본 프롬프트
    return systemPrompt + '\n\nUser: ' + userInput + '\nAssistant:';
  }

  /**
   * 기본 의도 분류
   */
  private detectBasicIntent(input: string): string {
    const lowerInput = input.toLowerCase();

    // 인사 패턴
    if (
      lowerInput.includes('안녕') ||
      lowerInput.includes('hello') ||
      lowerInput.includes('hi')
    ) {
      return 'greeting';
    }

    // 거래 기록 패턴
    if (
      lowerInput.includes('원') ||
      lowerInput.includes('지출') ||
      lowerInput.includes('결제') ||
      lowerInput.includes('샀') ||
      lowerInput.includes('구매') ||
      lowerInput.includes('카페') ||
      lowerInput.includes('식당') ||
      lowerInput.includes('마트') ||
      /\d+원/.test(lowerInput)
    ) {
      return 'transaction_record';
    }

    // 재정 조언 패턴
    if (
      lowerInput.includes('조언') ||
      lowerInput.includes('팁') ||
      lowerInput.includes('어떻게') ||
      lowerInput.includes('방법') ||
      lowerInput.includes('절약') ||
      lowerInput.includes('예산')
    ) {
      return 'financial_advice';
    }

    // 목표 설정 패턴
    if (
      lowerInput.includes('목표') ||
      lowerInput.includes('저축') ||
      lowerInput.includes('계획') ||
      lowerInput.includes('모으기') ||
      lowerInput.includes('달성')
    ) {
      return 'goal_setting';
    }

    // 분석 패턴
    if (
      lowerInput.includes('분석') ||
      lowerInput.includes('현황') ||
      lowerInput.includes('통계') ||
      lowerInput.includes('얼마나') ||
      lowerInput.includes('얼마') ||
      lowerInput.includes('패턴')
    ) {
      return 'spending_analysis';
    }

    return 'general_question';
  }

  /**
   * 에러 처리
   */
  private handleError(error: any, userInput: string): AIResponse {
    const errorResponse: AIResponse = {
      id: `error_${Date.now()}`,
      content:
        '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      intent: 'unknown',
      confidence: 0,
      suggestions: ['다시 시도하기', '간단히 다시 말씀해주세요'],
      metadata: {
        tokensUsed: 0,
        responseTime: Date.now(),
        modelVersion: this.config.modelName,
      },
    };

    return errorResponse;
  }

  /**
   * Python LLM 서버 상태 확인
   */
  private async checkModelHealth(): Promise<boolean> {
    try {
      // Python LLM 서버 연결 상태 확인
      const isConnected = await pythonLLMService.testConnection();

      if (!isConnected) {
        console.warn('Python LLM Server is not connected');
        return false;
      }

      // 테스트 응답 생성
      const testResponse = await this.callExaoneModel('안녕하세요');

      console.log('Python LLM Server health check response:', testResponse);

      // JSON 파싱 및 응답 검증
      try {
        const parsed = JSON.parse(testResponse);
        return !!(parsed.response && parsed.status);
      } catch (parseError) {
        console.warn('Failed to parse test response:', parseError);
        return false;
      }
    } catch (error) {
      console.warn('Python LLM Server health check failed:', error);
      return false;
    }
  }

  /**
   * 캐시 관련 메소드들
   */
  private getCachedResponse(query: string): CachedResponse | null {
    const cacheKey = this.generateCacheKey(query);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > new Date()) {
      cached.hitCount++;
      return cached;
    }

    if (cached) {
      this.cache.delete(cacheKey);
    }

    return null;
  }

  private async cacheResponse(
    query: string,
    response: AIResponse
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(query);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30분 캐시

    const cachedResponse: CachedResponse = {
      id: response.id,
      query,
      response,
      timestamp: new Date(),
      expiresAt,
      hitCount: 0,
    };

    this.cache.set(cacheKey, cachedResponse);
    this.state.cacheSize = this.cache.size;

    // 영구 저장
    await this.saveCache();
  }

  private generateCacheKey(query: string): string {
    // 웹 호환성을 위해 Buffer 대신 btoa 사용
    try {
      return `cache_${btoa(unescape(encodeURIComponent(query))).substring(0, 32)}`;
    } catch (error) {
      // 폴백: 간단한 해시 생성
      return `cache_${query.replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;
    }
  }

  private async loadCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('exaone_cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        this.cache = new Map(cacheData);
        this.state.cacheSize = this.cache.size;
      }
    } catch (error) {
      console.warn('Failed to load cache:', error);
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const cacheData = Array.from(this.cache.entries());
      await AsyncStorage.setItem('exaone_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache:', error);
    }
  }

  /**
   * 메트릭 관련 메소드들
   */
  private updateMetrics(
    startTime: number,
    tokensUsed: number,
    success: boolean
  ): void {
    const responseTime = Date.now() - startTime;

    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulRequests++;
    }

    this.metrics.totalTokensUsed += tokensUsed;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) +
        responseTime) /
      this.metrics.totalRequests;

    this.metrics.errorRate =
      (this.metrics.totalRequests - this.metrics.successfulRequests) /
      this.metrics.totalRequests;
  }

  private updateCacheHitRate(): void {
    const cacheHits = Array.from(this.cache.values()).reduce(
      (sum, cached) => sum + cached.hitCount,
      0
    );
    this.metrics.cacheHitRate = cacheHits / this.metrics.totalRequests;
  }

  private async loadMetrics(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('exaone_metrics');
      if (stored) {
        this.metrics = { ...this.metrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load metrics:', error);
    }
  }

  private async saveMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'exaone_metrics',
        JSON.stringify(this.metrics)
      );
    } catch (error) {
      console.warn('Failed to save metrics:', error);
    }
  }

  /**
   * 세션 관리
   */
  private async loadOrCreateSession(
    sessionId: string,
    userContext?: UserContext
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`session_${sessionId}`);
      if (stored) {
        this.currentSession = JSON.parse(stored);
      } else if (userContext) {
        this.currentSession = {
          id: sessionId,
          userId: userContext.userId,
          messages: [],
          context: userContext,
          startTime: new Date(),
          lastActivity: new Date(),
          metadata: {
            totalTokensUsed: 0,
            messageCount: 0,
            averageResponseTime: 0,
          },
        };
      }
    } catch (error) {
      console.warn('Failed to load session:', error);
    }
  }

  private addMessageToSession(userInput: string, aiResponse: string): void {
    if (!this.currentSession) return;

    const userMessage: AIMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    const assistantMessage: AIMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    this.currentSession.messages.push(userMessage, assistantMessage);
    this.currentSession.lastActivity = new Date();
    this.currentSession.metadata.messageCount += 2;

    // 세션 저장
    AsyncStorage.setItem(
      `session_${this.currentSession.id}`,
      JSON.stringify(this.currentSession)
    );
  }

  /**
   * 공개 메소드들
   */
  getServiceState(): AIServiceState {
    return { ...this.state };
  }

  getMetrics(): AIMetrics {
    return { ...this.metrics };
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    this.state.cacheSize = 0;
    await AsyncStorage.removeItem('exaone_cache');
  }

  async resetMetrics(): Promise<void> {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      cacheHitRate: 0,
      errorRate: 0,
    };
    await AsyncStorage.removeItem('exaone_metrics');
  }
}

// 싱글톤 인스턴스 내보내기
export const exaoneService = new ExaoneService();
