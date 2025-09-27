import Redis, { RedisOptions } from 'ioredis';

class CacheService {
  private client: any;
  private isConnected: boolean = false;

  constructor() {
    const config: RedisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    this.client = new Redis(config);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('Redis 연결됨');
      this.isConnected = true;
    });

    this.client.on('error', (error: Error) => {
      console.error('Redis 오류:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('Redis 연결 종료됨');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Redis 연결 실패:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
    this.isConnected = false;
  }

  // 기본 캐시 작업
  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('캐시 조회 오류:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('캐시 저장 오류:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('캐시 삭제 오류:', error);
      return false;
    }
  }

  // JSON 객체 캐싱
  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      return null;
    }
  }

  async setJSON(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttl);
    } catch (error) {
      console.error('JSON 직렬화 오류:', error);
      return false;
    }
  }

  // 사용자별 캐시 키 생성
  getUserKey(userId: string, suffix: string): string {
    return `user:${userId}:${suffix}`;
  }

  // 트랜잭션 캐시
  async cacheUserTransactions(userId: string, transactions: any[]): Promise<boolean> {
    const key = this.getUserKey(userId, 'transactions');
    return await this.setJSON(key, transactions, 300); // 5분 TTL
  }

  async getUserTransactions(userId: string): Promise<any[] | null> {
    const key = this.getUserKey(userId, 'transactions');
    return await this.getJSON<any[]>(key);
  }

  // 예산 캐시
  async cacheUserBudgets(userId: string, budgets: any[]): Promise<boolean> {
    const key = this.getUserKey(userId, 'budgets');
    return await this.setJSON(key, budgets, 600); // 10분 TTL
  }

  async getUserBudgets(userId: string): Promise<any[] | null> {
    const key = this.getUserKey(userId, 'budgets');
    return await this.getJSON<any[]>(key);
  }

  // 목표 캐시
  async cacheUserGoals(userId: string, goals: any[]): Promise<boolean> {
    const key = this.getUserKey(userId, 'goals');
    return await this.setJSON(key, goals, 600); // 10분 TTL
  }

  async getUserGoals(userId: string): Promise<any[] | null> {
    const key = this.getUserKey(userId, 'goals');
    return await this.getJSON<any[]>(key);
  }

  // 대시보드 데이터 캐시
  async cacheDashboardData(userId: string, data: any): Promise<boolean> {
    const key = this.getUserKey(userId, 'dashboard');
    return await this.setJSON(key, data, 180); // 3분 TTL
  }

  async getDashboardData(userId: string): Promise<any | null> {
    const key = this.getUserKey(userId, 'dashboard');
    return await this.getJSON(key);
  }

  // 세션 관리
  async setUserSession(sessionId: string, userId: string, ttl: number = 3600): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.set(key, userId, ttl);
  }

  async getUserSession(sessionId: string): Promise<string | null> {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  async deleteUserSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  // 사용자별 캐시 무효화
  async invalidateUserCache(userId: string): Promise<void> {
    const pattern = `user:${userId}:*`;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('캐시 무효화 오류:', error);
    }
  }

  // 연결 상태 확인
  isReady(): boolean {
    return this.isConnected;
  }

  // 캐시 통계
  async getStats(): Promise<any> {
    if (!this.isConnected) return null;

    try {
      const info = await this.client.info('memory');
      return info;
    } catch (error) {
      console.error('캐시 통계 조회 오류:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스
const cacheService = new CacheService();

export default cacheService;