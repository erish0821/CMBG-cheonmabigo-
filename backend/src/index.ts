import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Model } from 'objection';
import Knex from 'knex';

// 환경 변수 로드
dotenv.config();

// 데이터베이스 연결 설정
const knexConfig = require('../knexfile');
const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);
Model.knex(knex);

const app = express();
const PORT = process.env.PORT || 3001;

// 보안 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 100 requests per 15 minutes
  message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
});
app.use('/api', limiter);

// 로깅
app.use(morgan('combined'));

// 요청 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '천마비고 API 서버가 정상 작동 중입니다.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'OK'
  });
});

// 간단한 API 엔드포인트들
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API 테스트 성공',
    timestamp: new Date().toISOString()
  });
});

// 데이터베이스 연결 테스트
app.get('/api/db-test', async (req, res) => {
  try {
    // 기존 테이블이 있으면 삭제하고 새로 생성
    await knex.schema.dropTableIfExists('users');

    // users 테이블 생성 (완전한 스키마)
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email', 255).notNullable().unique();
      table.string('password', 255).notNullable();
      table.string('name', 100).notNullable();
      table.string('phone_number', 20).nullable();
      table.date('birth_date').nullable();
      table.enum('gender', ['male', 'female', 'other']).nullable();
      table.boolean('is_active').defaultTo(true);
      table.boolean('email_verified').defaultTo(false);
      table.timestamp('email_verified_at').nullable();
      table.timestamp('last_login_at').nullable();
      table.integer('login_count').defaultTo(0);
      table.json('preferences').nullable();
      table.string('timezone', 50).defaultTo('Asia/Seoul');
      table.string('language', 10).defaultTo('ko');
      table.timestamps(true, true);
    });

    res.json({
      success: true,
      message: '데이터베이스 연결 및 테이블 생성 성공',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('DB test error:', error);
    res.json({
      success: false,
      message: '데이터베이스 테스트 실패',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// 라우트 활성화
import authRoutes from './routes/auth';
// import transactionRoutes from './routes/transactions';

app.use('/api/auth', authRoutes);
// app.use('/api/transactions', transactionRoutes);

// 404 에러 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'API 엔드포인트를 찾을 수 없습니다.',
    path: req.originalUrl
  });
});

// 에러 핸들러
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('서버 에러:', err);

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? '내부 서버 오류가 발생했습니다.'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 간단한 서버 시작
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                    천마비고 Backend Server                   ║
║                                                          ║
║  🚀 서버가 포트 ${PORT}에서 시작되었습니다                        ║
║  🏥 헬스체크: http://localhost:${PORT}/health               ║
║  🔗 API 테스트: http://localhost:${PORT}/api/test            ║
║  🌍 환경: ${process.env.NODE_ENV || 'development'}                              ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;