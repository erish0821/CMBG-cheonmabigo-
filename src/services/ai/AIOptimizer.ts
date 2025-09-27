import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AIResponse,
  CachedResponse,
  AIMetrics,
  UserContext,
  MessageIntent,
} from '../../types/ai';

/**
 * AI 성능 최적화 및 캐싱 시스템
 * 토큰 사용량 최적화, 응답 캐싱, 배치 처리 관리
 */
export class AIOptimizer {
  private cache: Map<string, CachedResponse> = new Map();
  private batchQueue: Array<{
    id: string;
    input: string;
    context?: UserContext;
    resolve: (response: AIResponse) => void;
    reject: (error: Error) => void;
  }> = [];

  private batchTimer?: NodeJS.Timeout;
  private readonly BATCH_SIZE = 3;
  private readonly BATCH_DELAY = 1000; // 1초
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30분
  private readonly MAX_CACHE_SIZE = 100;

  private metrics: AIMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    averageResponseTime: 0,
    totalTokensUsed: 0,
    cacheHitRate: 0,
    errorRate: 0,
  };

  constructor() {
    this.loadCacheFromStorage();
    this.loadMetricsFromStorage();
    this.startCacheCleanup();
  }

  /**
   * 토큰 최적화된 프롬프트 생성
   */
  optimizePrompt(prompt: string, context?: UserContext): string {
    // 1. 불필요한 공백 제거
    let optimized = prompt.replace(/\s+/g, ' ').trim();

    // 2. 중복 정보 제거
    optimized = this.removeDuplicateInformation(optimized);

    // 3. 컨텍스트 압축
    if (context) {
      optimized = this.compressContext(optimized, context);
    }

    // 4. 토큰 수 제한 (대략 4000 토큰으로 제한)
    optimized = this.limitTokens(optimized, 4000);

    return optimized;
  }

  /**
   * 응답 캐싱 확인
   */
  getCachedResponse(query: string, context?: UserContext): AIResponse | null {
    const cacheKey = this.generateCacheKey(query, context);
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached)) {
      cached.hitCount++;
      this.updateCacheHitRate();
      return cached.response;
    }

    // 만료된 캐시 제거
    if (cached) {
      this.cache.delete(cacheKey);
    }

    return null;
  }

  /**
   * 응답 캐싱
   */
  cacheResponse(
    query: string,
    response: AIResponse,
    context?: UserContext
  ): void {
    const cacheKey = this.generateCacheKey(query, context);

    // 캐시 크기 제한 확인
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestCache();
    }

    const cachedResponse: CachedResponse = {
      id: response.id,
      query,
      response,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.CACHE_TTL),
      hitCount: 0,
    };

    this.cache.set(cacheKey, cachedResponse);
    this.saveCacheToStorage();
  }

  /**
   * 배치 처리 요청 추가
   */
  addToBatch(input: string, context?: UserContext): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      const batchItem = {
        id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        input,
        context,
        resolve,
        reject,
      };

      this.batchQueue.push(batchItem);

      // 배치 크기에 도달하면 즉시 처리
      if (this.batchQueue.length >= this.BATCH_SIZE) {
        this.processBatch();
      } else {
        // 타이머 설정 (지연 처리)
        this.scheduleNextBatch();
      }
    });
  }

  /**
   * 유사 질문 검색
   */
  findSimilarQuestions(
    query: string,
    threshold: number = 0.8
  ): CachedResponse[] {
    const similar: Array<{ cache: CachedResponse; similarity: number }> = [];

    this.cache.forEach(cached => {
      const similarity = this.calculateSimilarity(query, cached.query);
      if (similarity >= threshold) {
        similar.push({ cache: cached, similarity });
      }
    });

    // 유사도 순으로 정렬
    return similar
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.cache)
      .slice(0, 5); // 상위 5개만 반환
  }

  /**
   * 성능 메트릭 업데이트
   */
  updateMetrics(
    responseTime: number,
    tokensUsed: number,
    isSuccess: boolean
  ): void {
    this.metrics.totalRequests++;

    if (isSuccess) {
      this.metrics.successfulRequests++;
    }

    // 평균 응답 시간 업데이트
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) +
        responseTime) /
      this.metrics.totalRequests;

    this.metrics.totalTokensUsed += tokensUsed;

    // 에러율 계산
    this.metrics.errorRate =
      (this.metrics.totalRequests - this.metrics.successfulRequests) /
      this.metrics.totalRequests;

    this.saveMetricsToStorage();
  }

  /**
   * 의도별 캐시 전략
   */
  getCacheStrategy(intent: MessageIntent): {
    ttl: number;
    priority: 'high' | 'medium' | 'low';
    shouldCache: boolean;
  } {
    const strategies = {
      financial_advice: {
        ttl: 60 * 60 * 1000, // 1시간 - 조언은 오래 유효
        priority: 'high' as const,
        shouldCache: true,
      },
      spending_analysis: {
        ttl: 30 * 60 * 1000, // 30분 - 분석은 데이터 변경에 민감
        priority: 'medium' as const,
        shouldCache: true,
      },
      transaction_record: {
        ttl: 5 * 60 * 1000, // 5분 - 거래는 실시간성 중요
        priority: 'low' as const,
        shouldCache: false,
      },
      goal_setting: {
        ttl: 2 * 60 * 60 * 1000, // 2시간 - 목표는 장기간 유효
        priority: 'high' as const,
        shouldCache: true,
      },
      greeting: {
        ttl: 10 * 60 * 1000, // 10분 - 인사는 짧게
        priority: 'low' as const,
        shouldCache: true,
      },
      general_question: {
        ttl: 45 * 60 * 1000, // 45분
        priority: 'medium' as const,
        shouldCache: true,
      },
      unknown: {
        ttl: 15 * 60 * 1000, // 15분
        priority: 'low' as const,
        shouldCache: false,
      },
    };

    return strategies[intent] || strategies.unknown;
  }

  /**
   * 프롬프트 압축 관련 메소드들
   */
  private removeDuplicateInformation(prompt: string): string {
    const lines = prompt.split('\n');
    const uniqueLines = Array.from(new Set(lines));
    return uniqueLines.join('\n');
  }

  private compressContext(prompt: string, context: UserContext): string {
    // 컨텍스트 요약
    const summary = this.summarizeContext(context);

    // 원본 컨텍스트를 요약본으로 교체
    return prompt.replace(
      /사용자 컨텍스트:[\s\S]*?(?=\n\n|$)/,
      `사용자 컨텍스트: ${summary}`
    );
  }

  private summarizeContext(context: UserContext): string {
    const recentCount = Math.min(context.recentTransactions.length, 5);
    const totalSpent = context.recentTransactions
      .slice(0, recentCount)
      .reduce((sum, t) => sum + t.amount, 0);

    return `최근 ${recentCount}건 거래, 총 ${totalSpent.toLocaleString()}원 지출`;
  }

  private limitTokens(text: string, maxTokens: number): string {
    // 한국어 기준 대략 1.5 글자당 1토큰으로 추정
    const maxChars = Math.floor(maxTokens / 1.5);

    if (text.length <= maxChars) {
      return text;
    }

    // 중요한 부분 우선 유지 (시스템 프롬프트, 사용자 입력)
    const sections = text.split('\n\n');
    let result = '';
    let currentLength = 0;

    for (const section of sections) {
      if (currentLength + section.length <= maxChars) {
        result += section + '\n\n';
        currentLength += section.length + 2;
      } else {
        // 남은 공간에 맞춰 잘라내기
        const remainingSpace = maxChars - currentLength;
        if (remainingSpace > 50) {
          result += section.substring(0, remainingSpace - 3) + '...';
        }
        break;
      }
    }

    return result.trim();
  }

  /**
   * 캐시 관련 메소드들
   */
  private generateCacheKey(query: string, context?: UserContext): string {
    const baseKey = Buffer.from(query.toLowerCase().trim()).toString('base64');

    if (context) {
      const contextHash = this.hashContext(context);
      return `${baseKey}_${contextHash}`;
    }

    return baseKey;
  }

  private hashContext(context: UserContext): string {
    // 컨텍스트의 주요 특징으로 해시 생성
    const features = [
      context.userId,
      context.monthlyBudget || 0,
      context.recentTransactions.length,
      context.preferences.responseStyle,
    ].join('|');

    return Buffer.from(features).toString('base64').substring(0, 8);
  }

  private isCacheValid(cached: CachedResponse): boolean {
    return cached.expiresAt > new Date();
  }

  private evictOldestCache(): void {
    let oldest: string | null = null;
    let oldestTime = Date.now();

    this.cache.forEach((cached, key) => {
      if (cached.timestamp.getTime() < oldestTime) {
        oldestTime = cached.timestamp.getTime();
        oldest = key;
      }
    });

    if (oldest) {
      this.cache.delete(oldest);
    }
  }

  private updateCacheHitRate(): void {
    const totalHits = Array.from(this.cache.values()).reduce(
      (sum, cached) => sum + cached.hitCount,
      0
    );

    this.metrics.cacheHitRate = totalHits / this.metrics.totalRequests;
  }

  /**
   * 배치 처리 관련 메소드들
   */
  private scheduleNextBatch(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      if (this.batchQueue.length > 0) {
        this.processBatch();
      }
    }, this.BATCH_DELAY);
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, this.BATCH_SIZE);

    // 배치 처리 로직 (실제로는 AI 서비스 호출)
    for (const item of batch) {
      try {
        // 실제 구현에서는 여기서 AI 서비스를 호출
        // 현재는 더미 응답 생성
        const response: AIResponse = {
          id: item.id,
          content: `배치 처리된 응답: ${item.input}`,
          intent: 'general_question',
          confidence: 0.8,
          metadata: {
            tokensUsed: item.input.length,
            responseTime: Date.now(),
            modelVersion: 'EXAONE-3.5-7.8B',
          },
        };

        item.resolve(response);
      } catch (error) {
        item.reject(error as Error);
      }
    }
  }

  /**
   * 유사도 계산
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // 간단한 자카드 유사도 계산
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...set1].filter(word => set2.has(word)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * 저장소 관련 메소드들
   */
  private async loadCacheFromStorage(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('ai_cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        this.cache = new Map(
          cacheData.map((item: any) => [
            item.key,
            {
              ...item.value,
              timestamp: new Date(item.value.timestamp),
              expiresAt: new Date(item.value.expiresAt),
            },
          ])
        );
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private async saveCacheToStorage(): Promise<void> {
    try {
      const cacheData = Array.from(this.cache.entries()).map(
        ([key, value]) => ({
          key,
          value,
        })
      );
      await AsyncStorage.setItem('ai_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private async loadMetricsFromStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('ai_metrics');
      if (stored) {
        this.metrics = { ...this.metrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load metrics from storage:', error);
    }
  }

  private async saveMetricsToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('ai_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Failed to save metrics to storage:', error);
    }
  }

  /**
   * 캐시 정리 작업
   */
  private startCacheCleanup(): void {
    // 1시간마다 만료된 캐시 정리
    setInterval(
      () => {
        const now = new Date();
        const keysToDelete: string[] = [];

        this.cache.forEach((cached, key) => {
          if (cached.expiresAt <= now) {
            keysToDelete.push(key);
          }
        });

        keysToDelete.forEach(key => this.cache.delete(key));

        if (keysToDelete.length > 0) {
          console.log(
            `Cleaned up ${keysToDelete.length} expired cache entries`
          );
          this.saveCacheToStorage();
        }
      },
      60 * 60 * 1000
    ); // 1시간
  }

  /**
   * 공개 메소드들
   */
  getMetrics(): AIMetrics {
    return { ...this.metrics };
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      hitRate: this.metrics.cacheHitRate,
      totalHits: Array.from(this.cache.values()).reduce(
        (sum, cached) => sum + cached.hitCount,
        0
      ),
    };
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem('ai_cache');
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
    await AsyncStorage.removeItem('ai_metrics');
  }
}
