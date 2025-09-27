# 백엔드 API 서버 구축

Node.js와 Express를 사용하여 천마비고 앱의 백엔드 API 서버를 구축합니다.

## 실행할 작업

1. **백엔드 프로젝트 초기화**
   ```bash
   mkdir backend && cd backend
   npm init -y
   npm install express cors helmet morgan dotenv
   npm install --save-dev @types/node @types/express typescript nodemon ts-node
   ```

2. **Express 서버 설정**
   - `src/app.ts` - Express 애플리케이션 설정
   - `src/server.ts` - 서버 시작점
   - 미들웨어 설정 (CORS, 헬멧, 로깅)
   - 에러 핸들링 미들웨어

3. **라우터 구조**
   ```
   src/routes/
   ├── auth.ts          # 인증 관련
   ├── transactions.ts  # 거래 CRUD
   ├── users.ts         # 사용자 관리
   ├── analytics.ts     # 분석 데이터
   ├── ai.ts           # AI 서비스
   └── budgets.ts      # 예산 관리
   ```

4. **API 엔드포인트 설계**
   ```typescript
   // 인증
   POST /api/auth/register
   POST /api/auth/login
   POST /api/auth/refresh
   POST /api/auth/logout
   
   // 거래
   GET /api/transactions
   POST /api/transactions
   PUT /api/transactions/:id
   DELETE /api/transactions/:id
   GET /api/transactions/search
   
   // AI
   POST /api/ai/chat
   POST /api/ai/parse-transaction
   POST /api/ai/generate-insights
   
   // 분석
   GET /api/analytics/summary
   GET /api/analytics/trends
   GET /api/analytics/categories
   ```

5. **컨트롤러 구현**
   - `src/controllers/AuthController.ts`
   - `src/controllers/TransactionController.ts`
   - `src/controllers/AIController.ts`
   - `src/controllers/AnalyticsController.ts`
   - 비즈니스 로직 분리

6. **서비스 레이어**
   - `src/services/UserService.ts`
   - `src/services/TransactionService.ts`
   - `src/services/AIService.ts`
   - `src/services/AnalyticsService.ts`
   - 데이터 처리 로직

7. **미들웨어**
   - `src/middleware/auth.ts` - JWT 토큰 검증
   - `src/middleware/validation.ts` - 입력 데이터 검증
   - `src/middleware/rateLimit.ts` - API 호출 제한
   - `src/middleware/errorHandler.ts` - 전역 에러 처리

8. **데이터 검증**
   ```bash
   npm install joi express-validator
   ```
   - 요청 스키마 정의
   - 자동 검증 미들웨어
   - 에러 메시지 표준화

9. **API 문서화**
   ```bash
   npm install swagger-jsdoc swagger-ui-express
   ```
   - Swagger 설정
   - API 스펙 자동 생성
   - 인터랙티브 문서

10. **로깅 시스템**
    ```bash
    npm install winston winston-daily-rotate-file
    ```
    - 구조화된 로깅
    - 로그 레벨 관리
    - 파일 로테이션

**프로젝트 구조**:
```
backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   ├── types/
│   ├── config/
│   ├── app.ts
│   └── server.ts
├── tests/
├── docs/
├── package.json
└── tsconfig.json
```

**환경 변수 설정**:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cheonmabigo
DB_USER=postgres
DB_PASSWORD=password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
EXAONE_API_KEY=your-api-key
```

**에러 응답 표준화**:
```typescript
interface ApiResponse<T = any> {
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
```

**보안 설정**:
- HTTPS 강제
- CORS 설정
- Rate limiting
- 헬멧 보안 헤더
- 입력 데이터 새니타이제이션
- SQL 인젝션 방지

**성능 최적화**:
- 압축 미들웨어
- 캐싱 전략
- 데이터베이스 인덱싱
- 커넥션 풀링
- 응답 페이지네이션

**테스트 설정**:
```bash
npm install --save-dev jest supertest @types/jest @types/supertest
```
- 단위 테스트
- 통합 테스트
- API 테스트
- 테스트 데이터베이스

**추가 인수**: $ARGUMENTS (특정 API나 기능)

백엔드 API 완료 후 `/11-database` 명령어로 데이터베이스를 설정하세요.