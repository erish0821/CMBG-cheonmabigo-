import express from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { auth } from '../middleware/auth';

const router = express.Router();

// 모든 분석 API는 인증이 필요
router.use(auth);

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: 재정 요약 데이터 조회
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: 조회 기간
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 시작 날짜
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 종료 날짜
 *     responses:
 *       200:
 *         description: 요약 데이터 조회 성공
 */
router.get('/summary', AnalyticsController.getSummary);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: 지출 트렌드 분석
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: 트렌드 기간
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 특정 카테고리 분석
 *     responses:
 *       200:
 *         description: 트렌드 분석 결과
 */
router.get('/trends', AnalyticsController.getTrends);

/**
 * @swagger
 * /api/analytics/categories:
 *   get:
 *     summary: 카테고리별 지출 분석
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: 조회 기간
 *     responses:
 *       200:
 *         description: 카테고리별 분석 결과
 */
router.get('/categories', AnalyticsController.getCategoryAnalysis);

/**
 * @swagger
 * /api/analytics/insights:
 *   get:
 *     summary: AI 기반 재정 인사이트
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI 인사이트 조회 성공
 */
router.get('/insights', AnalyticsController.getInsights);

/**
 * @swagger
 * /api/analytics/budget-analysis:
 *   get:
 *     summary: 예산 대비 지출 분석
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: budgetId
 *         schema:
 *           type: string
 *         description: 특정 예산 ID
 *     responses:
 *       200:
 *         description: 예산 분석 결과
 */
router.get('/budget-analysis', AnalyticsController.getBudgetAnalysis);

/**
 * @swagger
 * /api/analytics/spending-patterns:
 *   get:
 *     summary: 지출 패턴 분석
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: analysisType
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, seasonal]
 *         description: 분석 유형
 *     responses:
 *       200:
 *         description: 지출 패턴 분석 결과
 */
router.get('/spending-patterns', AnalyticsController.getSpendingPatterns);

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     summary: 분석 데이터 내보내기
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel, pdf]
 *         description: 내보내기 형식
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: 조회 기간
 *     responses:
 *       200:
 *         description: 파일 다운로드
 */
router.get('/export', AnalyticsController.exportData);

export default router;