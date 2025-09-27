import express from 'express';
import { BudgetController } from '../controllers/BudgetController';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createBudgetSchema, updateBudgetSchema } from '../schemas/budgetSchemas';

const router = express.Router();

// 모든 예산 관련 API는 인증이 필요
router.use(auth);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: 예산 목록 조회
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: 활성 예산만 조회
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 특정 카테고리 예산
 *     responses:
 *       200:
 *         description: 예산 목록 조회 성공
 */
router.get('/', BudgetController.getBudgets);

/**
 * @swagger
 * /api/budgets/{id}:
 *   get:
 *     summary: 특정 예산 조회
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 예산 ID
 *     responses:
 *       200:
 *         description: 예산 조회 성공
 *       404:
 *         description: 예산을 찾을 수 없음
 */
router.get('/:id', BudgetController.getBudget);

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: 새 예산 생성
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - amount
 *               - category
 *               - period
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               period:
 *                 type: string
 *                 enum: [weekly, monthly, quarterly, yearly]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               alertThreshold:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       201:
 *         description: 예산 생성 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/', validateRequest(createBudgetSchema), BudgetController.createBudget);

/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: 예산 수정
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 예산 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               period:
 *                 type: string
 *               alertThreshold:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 예산 수정 성공
 *       404:
 *         description: 예산을 찾을 수 없음
 */
router.put('/:id', validateRequest(updateBudgetSchema), BudgetController.updateBudget);

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: 예산 삭제
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 예산 ID
 *     responses:
 *       200:
 *         description: 예산 삭제 성공
 *       404:
 *         description: 예산을 찾을 수 없음
 */
router.delete('/:id', BudgetController.deleteBudget);

/**
 * @swagger
 * /api/budgets/{id}/progress:
 *   get:
 *     summary: 예산 진행률 조회
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 예산 ID
 *     responses:
 *       200:
 *         description: 예산 진행률 조회 성공
 */
router.get('/:id/progress', BudgetController.getBudgetProgress);

/**
 * @swagger
 * /api/budgets/templates:
 *   get:
 *     summary: 예산 템플릿 조회
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 예산 템플릿 조회 성공
 */
router.get('/templates', BudgetController.getBudgetTemplates);

/**
 * @swagger
 * /api/budgets/recommendations:
 *   get:
 *     summary: AI 기반 예산 추천
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: income
 *         schema:
 *           type: number
 *         description: 월 소득
 *       - in: query
 *         name: goals
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 재정 목표
 *     responses:
 *       200:
 *         description: 예산 추천 결과
 */
router.get('/recommendations', BudgetController.getBudgetRecommendations);

export default router;