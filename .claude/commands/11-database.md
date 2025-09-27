# 데이터베이스 설정

PostgreSQL과 Redis를 사용하여 천마비고의 데이터 저장소를 구축합니다.

## 실행할 작업

1. **PostgreSQL 설치 및 설정**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **데이터베이스 클라이언트 라이브러리**
   ```bash
   npm install pg knex objection
   npm install --save-dev @types/pg
   ```

3. **데이터베이스 스키마 설계**
   ```sql
   -- 사용자 테이블
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     name VARCHAR(100) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- 거래 테이블
   CREATE TABLE transactions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     amount DECIMAL(12,2) NOT NULL,
     description TEXT NOT NULL,
     category VARCHAR(50) NOT NULL,
     subcategory VARCHAR(50),
     is_income BOOLEAN DEFAULT FALSE,
     payment_method VARCHAR(30),
     location VARCHAR(255),
     tags TEXT[],
     confidence DECIMAL(3,2),
     transaction_date TIMESTAMP NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- 예산 테이블
   CREATE TABLE budgets (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     category VARCHAR(50) NOT NULL,
     amount DECIMAL(12,2) NOT NULL,
     period VARCHAR(20) DEFAULT 'monthly',
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- 목표 테이블
   CREATE TABLE goals (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     title VARCHAR(255) NOT NULL,
     target_amount DECIMAL(12,2) NOT NULL,
     current_amount DECIMAL(12,2) DEFAULT 0,
     deadline DATE,
     status VARCHAR(20) DEFAULT 'active',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **Knex 마이그레이션 설정**
   - `knexfile.js` 설정
   - 마이그레이션 파일 생성
   - 시드 데이터 준비
   - 롤백 기능

5. **Objection.js 모델**
   - `src/models/User.ts`
   - `src/models/Transaction.ts`
   - `src/models/Budget.ts`
   - `src/models/Goal.ts`
   - 관계 설정 (hasMany, belongsTo)

6. **Redis 설정**
   ```bash
   # Redis 설치
   brew install redis  # macOS
   sudo apt-get install redis-server  # Ubuntu
   
   # Node.js 클라이언트
   npm install redis @types/redis
   ```

7. **캐싱 전략**
   - 사용자 세션 캐싱
   - 자주 조회되는 분석 데이터
   - AI 응답 캐싱
   - 거래 카테고리 매핑

8. **데이터베이스 연결 관리**
   ```typescript
   // src/config/database.ts
   import Knex from 'knex';
   import { Model } from 'objection';

   const knex = Knex({
     client: 'postgresql',
     connection: {
       host: process.env.DB_HOST,
       port: Number(process.env.DB_PORT),
       user: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
     },
     pool: {
       min: 2,
       max: 10
     }
   });

   Model.knex(knex);
   ```

9. **인덱스 최적화**
   ```sql
   -- 성능 최적화 인덱스
   CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
   CREATE INDEX idx_transactions_category ON transactions(category);
   CREATE INDEX idx_transactions_amount ON transactions(amount);
   CREATE INDEX idx_budgets_user_period ON budgets(user_id, period, start_date);
   ```

10. **백업 및 복원**
    - 자동 백업 스크립트
    - 포인트-인-타임 복구
    - 데이터 마이그레이션
    - 개발/운영 환경 분리

**모델 예시**:
```typescript
// src/models/Transaction.ts
import { Model } from 'objection';
import User from './User';

class Transaction extends Model {
  static tableName = 'transactions';

  id!: string;
  userId!: string;
  amount!: number;
  description!: string;
  category!: string;
  subcategory?: string;
  isIncome!: boolean;
  paymentMethod?: string;
  location?: string;
  tags!: string[];
  confidence?: number;
  transactionDate!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'transactions.user_id',
        to: 'users.id'
      }
    }
  };

  static jsonSchema = {
    type: 'object',
    required: ['userId', 'amount', 'description', 'category'],
    properties: {
      amount: { type: 'number', minimum: 0 },
      description: { type: 'string', minLength: 1 },
      category: { type: 'string', minLength: 1 }
    }
  };
}
```

**Redis 캐싱 서비스**:
```typescript
// src/services/CacheService.ts
import Redis from 'redis';

class CacheService {
  private client: Redis.RedisClientType;

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    await this.client.setEx(key, ttl, value);
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}
```

**환경별 설정**:
- 개발: 로컬 PostgreSQL + Redis
- 테스트: 인메모리 SQLite + Redis Mock
- 운영: AWS RDS + ElastiCache

**성능 모니터링**:
- 쿼리 실행 시간 로깅
- 커넥션 풀 모니터링
- 캐시 히트률 추적
- 슬로우 쿼리 감지

**추가 인수**: $ARGUMENTS (특정 테이블이나 설정)

데이터베이스 설정 완료 후 `/12-authentication` 명령어로 인증 시스템을 구현하세요.