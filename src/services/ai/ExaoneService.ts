// 간단한 AI 응답 시스템 (패턴 매칭 기반)
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

/**
 * LGAI EXAONE 3.5 7.8B 모델 통합 서비스
 * 한국어 특화 개인 재정 관리 AI
 */
export class ExaoneService {
  private config: ExaoneConfig;
  private promptManager: PromptManager;
  private responseParser: ResponseParser;
  private aiResponses: Map<string, string[]> = new Map(); // 미리 정의된 응답 패턴
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

    // 미리 정의된 AI 응답 패턴 초기화
    this.initializeResponsePatterns();

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

      // 응답 패턴 검증
      await this.validateResponsePatterns();

      this.state.isInitialized = true;
      this.state.modelLoaded = true;

      console.log(
        'ExaoneService initialized successfully with pattern matching'
      );
    } catch (error) {
      console.error('ExaoneService initialization failed:', error);
      this.state.errorCount++;
    }
  }

  /**
   * 미리 정의된 AI 응답 패턴 초기화
   */
  private initializeResponsePatterns(): void {
    // 거래 기록 관련 응답
    this.aiResponses.set('transaction', [
      '지출 내역을 기록했습니다! 더 자세한 정보를 알려주시면 정확히 분류해드릴게요.',
      '거래가 성공적으로 저장되었어요. 이번 달 예산 현황을 확인해보시겠어요?',
      '지출을 확인했습니다. 카테고리별로 정리해서 보여드릴까요?',
      '결제 내역이 기록되었습니다. 절약 팁이 필요하시면 언제든 말씀해주세요!',
    ]);

    // 재정 조언 관련 응답
    this.aiResponses.set('advice', [
      '가계 관리의 기본은 수입과 지출을 정확히 파악하는 것입니다. 매일 지출을 기록하고 월별 예산을 세워보세요.',
      '절약의 시작은 작은 습관부터입니다. 커피 한 잔을 줄이는 것만으로도 월 5만원을 절약할 수 있어요!',
      '50-30-20 법칙을 추천드려요. 수입의 50%는 필수지출, 30%는 여가비용, 20%는 저축으로 배분해보세요.',
      '가계부를 작성하면 불필요한 지출을 20% 이상 줄일 수 있다는 연구결과가 있어요. 꾸준히 기록해보세요!',
    ]);

    // 목표 설정 관련 응답
    this.aiResponses.set('goal', [
      '저축 목표를 세우셨군요! 구체적인 금액과 기간을 정하면 달성 확률이 42% 높아져요.',
      '목표가 있으면 동기부여가 더 쉬워져요. 중간 단계 목표도 함께 설정해보시는 건 어떨까요?',
      '훌륭한 목표네요! 달성을 위한 월별 계획을 세워드릴까요?',
      '목표 달성까지 함께 응원하겠습니다! 진행 상황을 정기적으로 체크해보아요.',
    ]);

    // 분석 관련 응답
    this.aiResponses.set('analysis', [
      '지출 패턴을 분석해보니 흥미로운 결과가 나왔어요. 어떤 부분을 자세히 알고 싶으신가요?',
      '이번 달 지출이 지난 달보다 조금 높아졌네요. 어떤 카테고리에서 늘어났는지 확인해보실까요?',
      '카페 지출이 꾸준히 증가하고 있어요. 홈카페를 시작해보시는 건 어떨까요?',
      '외식비가 예산의 25%를 차지하고 있어요. 주 1회만 줄여도 월 8만원을 절약할 수 있어요!',
    ]);

    // 일반 질문 관련 응답
    this.aiResponses.set('general', [
      '안녕하세요! 천마비고입니다. 재정 관리에 대해 무엇이든 물어보세요! 😊',
      '지출 기록, 예산 계획, 저축 목표 설정 등 도움이 필요한 부분이 있나요?',
      '오늘도 현명한 소비 습관을 만들어보아요! 어떤 도움이 필요하신가요?',
      '천마비고와 함께 경제적 자유를 향해 한 걸음씩 나아가보아요! 💪',
    ]);

    // 인사 관련 응답
    this.aiResponses.set('greeting', [
      '안녕하세요! 반갑습니다. 오늘은 어떤 재정 관리를 도와드릴까요?',
      '안녕하세요! 천마비고입니다. 똑똑한 가계 관리를 시작해보아요!',
      '반가워요! 오늘도 현명한 소비로 목표에 한 걸음 더 가까워져요.',
      '안녕하세요! 재정 관리의 든든한 파트너 천마비고예요. 🏦',
    ]);
  }

  /**
   * 응답 패턴 검증
   */
  private async validateResponsePatterns(): Promise<void> {
    const requiredPatterns = [
      'transaction',
      'advice',
      'goal',
      'analysis',
      'general',
      'greeting',
    ];

    for (const pattern of requiredPatterns) {
      if (
        !this.aiResponses.has(pattern) ||
        this.aiResponses.get(pattern)!.length === 0
      ) {
        console.warn(`Missing response pattern: ${pattern}`);
      }
    }

    console.log(
      `Loaded ${this.aiResponses.size} response patterns with ${Array.from(
        this.aiResponses.values()
      ).reduce((sum, arr) => sum + arr.length, 0)} total responses`
    );
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
   * 실제 EXAONE 3.5 7.8B 모델 API 호출
   */
  private async callExaoneModel(prompt: string): Promise<string> {
    try {
      console.log('Calling EXAONE API with prompt:', prompt);

      if (!this.config.apiKey) {
        console.warn('No API key provided, falling back to pattern matching');
        return this.generatePatternMatchingResponse(prompt);
      }

      const apiUrl =
        'https://api-inference.huggingface.co/models/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct';

      const requestBody = {
        inputs: prompt,
        parameters: {
          max_new_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: 0.9,
          do_sample: true,
          repetition_penalty: 1.1,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      };

      console.log('Making API request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(
          'API response not ok:',
          response.status,
          response.statusText
        );

        // API 오류 시 패턴 매칭으로 폴백
        if (response.status === 503) {
          console.log('Model loading, falling back to pattern matching');
          return this.generatePatternMatchingResponse(prompt);
        }

        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API response received:', result);

      // Hugging Face API 응답 형태 처리
      let aiResponse = '';
      if (Array.isArray(result) && result.length > 0) {
        aiResponse = result[0].generated_text || result[0].text || '';
      } else if (result.generated_text) {
        aiResponse = result.generated_text;
      } else if (typeof result === 'string') {
        aiResponse = result;
      }

      if (!aiResponse.trim()) {
        console.warn('Empty response from API, using fallback');
        return this.generatePatternMatchingResponse(prompt);
      }

      // 의도 분석
      const intent = this.detectBasicIntent(prompt);

      // JSON 형태로 포맷팅하여 기존 파서와 호환
      return JSON.stringify({
        intent: intent,
        response: aiResponse.trim(),
        suggestions: this.generateSuggestionsForIntent(intent),
        metadata: {
          confidence: 0.92,
          responseTime: Date.now(),
          version: 'EXAONE-3.5-7.8B',
          tokensUsed: this.estimateTokens(prompt + aiResponse),
        },
      });
    } catch (error) {
      console.error('EXAONE API call failed:', error);

      // API 실패 시 패턴 매칭으로 폴백
      console.log('Falling back to pattern matching due to API error');
      return this.generatePatternMatchingResponse(prompt);
    }
  }

  /**
   * 패턴 매칭 기반 폴백 응답 (API 실패시 사용)
   */
  private generatePatternMatchingResponse(prompt: string): string {
    try {
      console.log('Using pattern matching fallback for:', prompt);

      // 의도 분석을 위해 프롬프트 분석
      const intent = this.detectBasicIntent(prompt);
      console.log('Detected intent:', intent);

      // 의도에 따른 응답 선택
      const responses = this.getResponsesByIntent(intent);

      if (responses.length === 0) {
        return this.generateFallbackResponse(prompt);
      }

      // 랜덤하게 응답 선택 (다양성 제공)
      const randomIndex = Math.floor(Math.random() * responses.length);
      const selectedResponse = responses[randomIndex];

      console.log('Selected pattern response:', selectedResponse);

      // 응답을 JSON 형태로 포맷팅
      return JSON.stringify({
        intent: intent,
        response: selectedResponse,
        suggestions: this.generateSuggestionsForIntent(intent),
        metadata: {
          confidence: 0.75,
          responseTime: Date.now(),
          version: 'pattern-matching-fallback-v1.0',
          tokensUsed: this.estimateTokens(prompt + selectedResponse),
        },
      });
    } catch (error) {
      console.error('Pattern matching fallback failed:', error);
      return this.generateFallbackResponse(prompt);
    }
  }

  /**
   * 토큰 수 추정 (한국어 기준)
   */
  private estimateTokens(text: string): number {
    // 한국어는 대략 2-3글자당 1토큰으로 추정
    return Math.ceil(text.length / 2.5);
  }

  /**
   * 의도에 따른 응답 목록 반환
   */
  private getResponsesByIntent(intent: string): string[] {
    switch (intent) {
      case 'transaction_record':
        return this.aiResponses.get('transaction') || [];
      case 'financial_advice':
        return this.aiResponses.get('advice') || [];
      case 'goal_setting':
        return this.aiResponses.get('goal') || [];
      case 'spending_analysis':
        return this.aiResponses.get('analysis') || [];
      case 'greeting':
        return this.aiResponses.get('greeting') || [];
      default:
        return this.aiResponses.get('general') || [];
    }
  }

  /**
   * 의도에 따른 제안 사항 생성
   */
  private generateSuggestionsForIntent(intent: string): string[] {
    switch (intent) {
      case 'transaction_record':
        return [
          '카테고리별로 분류하기',
          '이번 달 지출 현황 보기',
          '절약 팁 받아보기',
        ];
      case 'financial_advice':
        return [
          '월 예산 계획 세우기',
          '지출 카테고리 분석하기',
          '절약 목표 설정하기',
        ];
      case 'goal_setting':
        return ['목표 달성 계획 세우기', '진행 상황 확인하기', '동기부여 받기'];
      case 'spending_analysis':
        return ['상세 분석 보기', '절약 포인트 찾기', '예산 조정하기'];
      case 'greeting':
        return [
          '오늘 지출 기록하기',
          '이번 달 예산 확인하기',
          '저축 목표 세우기',
        ];
      default:
        return ['지출 기록하기', '예산 계획 세우기', '재정 조언 받기'];
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
   * 향상된 의도 분류 (키워드 및 패턴 기반)
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
   * 폴백 응답 생성
   */
  private generateFallbackResponse(prompt: string): string {
    // 기본적인 패턴 매칭 응답
    if (prompt.includes('거래')) {
      return JSON.stringify({
        intent: 'transaction_record',
        response:
          '거래 내용을 확인했습니다. 더 자세한 정보를 제공해주시면 정확히 기록해드리겠습니다.',
        suggestions: [
          '금액과 항목을 다시 말씀해주세요',
          '어디서 결제하셨나요?',
        ],
      });
    }

    if (prompt.includes('조언') || prompt.includes('팁')) {
      return JSON.stringify({
        intent: 'financial_advice',
        response:
          '가계 관리의 기본은 수입과 지출을 정확히 파악하는 것입니다. 매일 지출을 기록하고 월별 예산을 세워보세요.',
        suggestions: [
          '월 예산 계획 세우기',
          '지출 카테고리 분석하기',
          '절약 목표 설정하기',
        ],
      });
    }

    return JSON.stringify({
      intent: 'general_question',
      response:
        '안녕하세요! 천마비고입니다. 재정 관리에 대해 무엇이든 물어보세요. 지출 기록, 예산 계획, 저축 목표 등을 도와드릴 수 있어요! 😊',
      suggestions: [
        '오늘 지출 기록하기',
        '이번 달 예산 확인하기',
        '저축 목표 세우기',
      ],
    });
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
   * 패턴 매칭 시스템 상태 확인
   */
  private async checkModelHealth(): Promise<boolean> {
    try {
      // 응답 패턴이 제대로 로드되었는지 확인
      const requiredPatterns = [
        'transaction',
        'advice',
        'goal',
        'analysis',
        'general',
        'greeting',
      ];

      for (const pattern of requiredPatterns) {
        if (
          !this.aiResponses.has(pattern) ||
          this.aiResponses.get(pattern)!.length === 0
        ) {
          console.warn(`Pattern missing or empty: ${pattern}`);
          return false;
        }
      }

      // 테스트 응답 생성
      const testResponse = await this.callExaoneModel('안녕하세요');

      console.log('Pattern matching health check response:', testResponse);

      // JSON 파싱 및 응답 검증
      try {
        const parsed = JSON.parse(testResponse);
        return !!(parsed.response && parsed.intent && parsed.suggestions);
      } catch (parseError) {
        console.warn('Failed to parse test response:', parseError);
        return false;
      }
    } catch (error) {
      console.warn('Pattern matching health check failed:', error);
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
