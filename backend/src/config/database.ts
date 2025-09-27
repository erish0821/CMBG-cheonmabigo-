import Knex from 'knex';
import { Model } from 'objection';
import cacheService from '../services/cache';

// 환경에 따른 설정 선택
const environment = process.env.NODE_ENV || 'development';

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'cheonmabigo_dev'
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10')
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
  debug: environment === 'development'
};

// Knex 인스턴스 생성
export const knex = Knex(config);

// Objection.js에 Knex 연결
Model.knex(knex);

// 데이터베이스 초기화
export const initializeDatabase = async (): Promise<void> => {
  try {
    // PostgreSQL 연결 테스트
    await knex.raw('SELECT 1+1 as result');
    console.log('✅ PostgreSQL 데이터베이스 연결 성공');

    // 마이그레이션 실행
    await knex.migrate.latest();
    console.log('✅ 데이터베이스 마이그레이션 완료');

    // Redis 연결 초기화
    try {
      await cacheService.connect();
      console.log('✅ Redis 캐시 연결 성공');
    } catch (cacheError) {
      console.warn('⚠️ Redis 연결 실패, 캐시 없이 진행:', cacheError);
    }
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  }
};

// 데이터베이스 연결 해제
export const closeDatabase = async (): Promise<void> => {
  try {
    // Redis 연결 종료
    if (cacheService.isReady()) {
      await cacheService.disconnect();
      console.log('✅ Redis 연결 종료');
    }

    // PostgreSQL 연결 종료
    await knex.destroy();
    console.log('🔌 PostgreSQL 데이터베이스 연결 해제');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 해제 실패:', error);
  }
};

// 연결 상태 확인
export const checkDatabaseHealth = async (): Promise<{postgres: boolean, redis: boolean}> => {
  const health = {
    postgres: false,
    redis: false
  };

  try {
    await knex.raw('SELECT 1');
    health.postgres = true;
  } catch (error) {
    console.error('PostgreSQL 연결 오류:', error);
  }

  try {
    health.redis = cacheService.isReady();
  } catch (error) {
    console.error('Redis 연결 오류:', error);
  }

  return health;
};

// 프로세스 종료 시 정리
process.on('beforeExit', closeDatabase);
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

export default knex;