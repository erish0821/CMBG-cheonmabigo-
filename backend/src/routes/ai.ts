import express from 'express';
import { AIController } from '../controllers/AIController';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { chatSchema, parseTransactionSchema } from '../schemas/aiSchemas';

const router = express.Router();

// 모든 AI API는 인증이 필요
router.use(auth);

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI 채팅 대화
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: 사용자 메시지
 *               sessionId:
 *                 type: string
 *                 description: 대화 세션 ID
 *               context:
 *                 type: object
 *                 description: 사용자 컨텍스트 정보
 *     responses:
 *       200:
 *         description: AI 응답 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/chat', validateRequest(chatSchema), AIController.chat);

/**
 * @swagger
 * /api/ai/parse-transaction:
 *   post:
 *     summary: 자연어 거래 내용 파싱
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: 파싱할 거래 내용
 *     responses:
 *       200:
 *         description: 거래 파싱 성공
 *       400:
 *         description: 파싱 실패
 */
router.post('/parse-transaction', validateRequest(parseTransactionSchema), AIController.parseTransaction);

/**
 * @swagger
 * /api/ai/generate-insights:
 *   post:
 *     summary: AI 기반 재정 인사이트 생성
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               period:
 *                 type: string
 *                 enum: [week, month, quarter, year]
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               analysisType:
 *                 type: string
 *                 enum: [spending, saving, budget, general]
 *     responses:
 *       200:
 *         description: 인사이트 생성 성공
 */
router.post('/generate-insights', AIController.generateInsights);

/**
 * @swagger
 * /api/ai/financial-advice:
 *   post:
 *     summary: 개인화된 재정 조언
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: 재정 관련 질문
 *               userProfile:
 *                 type: object
 *                 description: 사용자 프로필 정보
 *     responses:
 *       200:
 *         description: 재정 조언 생성 성공
 */
router.post('/financial-advice', AIController.getFinancialAdvice);

/**
 * @swagger
 * /api/ai/spending-prediction:
 *   post:
 *     summary: AI 지출 예측
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               period:
 *                 type: string
 *                 enum: [week, month, quarter]
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 지출 예측 성공
 */
router.post('/spending-prediction', AIController.predictSpending);

/**
 * @swagger
 * /api/ai/budget-suggestions:
 *   post:
 *     summary: AI 예산 제안
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               income:
 *                 type: number
 *                 description: 월 소득
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 재정 목표
 *               currentSpending:
 *                 type: object
 *                 description: 현재 지출 패턴
 *     responses:
 *       200:
 *         description: 예산 제안 성공
 */
router.post('/budget-suggestions', AIController.suggestBudget);

/**
 * @swagger
 * /api/ai/conversation-history:
 *   get:
 *     summary: AI 대화 이력 조회
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: 세션 ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 조회 개수
 *     responses:
 *       200:
 *         description: 대화 이력 조회 성공
 */
router.get('/conversation-history', AIController.getConversationHistory);

/**
 * @swagger
 * /api/ai/voice-to-text:
 *   post:
 *     summary: 음성을 텍스트로 변환
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: 음성 파일
 *               language:
 *                 type: string
 *                 default: ko-KR
 *                 description: 언어 코드
 *     responses:
 *       200:
 *         description: 음성 변환 성공
 */
router.post('/voice-to-text', AIController.voiceToText);

export default router;