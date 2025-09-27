import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { auth as authenticateToken } from '../middleware/auth';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
  updateProfileValidation
} from '../validators/authValidators';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 사용자 회원가입
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/register', registerValidation, AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       401:
 *         description: 인증 실패
 */
router.post('/login', loginValidation, AuthController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 토큰 갱신
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *       401:
 *         description: 인증 실패
 */
router.post('/refresh', refreshTokenValidation, AuthController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 사용자 정보 조회
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get('/me', authenticateToken, AuthController.getCurrentUser);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: 사용자 프로필 업데이트
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               preferences:
 *                 type: object
 *               timezone:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: 프로필 업데이트 성공
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.put('/profile', authenticateToken, updateProfileValidation, AuthController.updateProfile);

// 추가 라우트들 (임시 비활성화)
// router.post('/change-password', authenticateToken, changePasswordValidation, AuthController.changePassword);

export default router;