import express from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authenticateToken } from '../middleware/auth';
import {
  createTransactionValidation,
  updateTransactionValidation,
  bulkCreateTransactionsValidation,
  getTransactionsValidation
} from '../validators/transactionValidators';

const router = express.Router();

// 모든 거래 관련 API는 인증이 필요
router.use(authenticateToken);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: 거래 내역 조회
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
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
 *         description: 거래 내역 조회 성공
 */
router.get('/', getTransactionsValidation, TransactionController.getTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: 특정 거래 조회
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 거래 ID
 *     responses:
 *       200:
 *         description: 거래 조회 성공
 *       404:
 *         description: 거래를 찾을 수 없음
 */
router.get('/:id', TransactionController.getTransaction);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: 새 거래 생성
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - category
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               location:
 *                 type: string
 *               isIncome:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 거래 생성 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/', createTransactionValidation, TransactionController.createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: 거래 수정
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 거래 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               location:
 *                 type: string
 *               isIncome:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 거래 수정 성공
 *       404:
 *         description: 거래를 찾을 수 없음
 */
router.put('/:id', updateTransactionValidation, TransactionController.updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: 거래 삭제
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 거래 ID
 *     responses:
 *       200:
 *         description: 거래 삭제 성공
 *       404:
 *         description: 거래를 찾을 수 없음
 */
router.delete('/:id', TransactionController.deleteTransaction);

/**
 * @swagger
 * /api/transactions/search:
 *   get:
 *     summary: 거래 검색
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: 최소 금액
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: 최대 금액
 *     responses:
 *       200:
 *         description: 검색 결과
 */
router.get('/search', getTransactionsValidation, TransactionController.getTransactions);

// 추가 엔드포인트들
router.get('/summary', TransactionController.getTransactionSummary);
router.post('/bulk', bulkCreateTransactionsValidation, TransactionController.bulkCreateTransactions);

export default router;