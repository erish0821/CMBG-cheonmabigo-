import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Budget } from '../models/Budget';
import { ApiResponse, AuthRequest } from '../types';
// import { cacheService } from '../services/cache';

export class AuthController {
  /**
   * 사용자 회원가입
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // 이메일 중복 확인
      const existingUser = await User.query().findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: '이미 사용 중인 이메일입니다.',
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      // 비밀번호 해싱
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 사용자 생성
      const user = await User.query().insert({
        email,
        password: hashedPassword,
        name,
        is_active: true,
        email_verified: false,
      });

      // JWT 토큰 생성
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // 리프레시 토큰을 Redis에 저장 (임시 비활성화)
      // await cacheService.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7일

      // 비밀번호 제거하고 응답
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: '회원가입 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    }
  }

  /**
   * 사용자 로그인
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 사용자 조회
      const user = await User.query().findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      // 계정 활성화 확인
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: '비활성화된 계정입니다.',
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      // 마지막 로그인 시간 업데이트
      await User.query().patchAndFetchById(user.id, {
        last_login_at: new Date().toISOString(),
      } as any);

      // JWT 토큰 생성
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // 리프레시 토큰을 Redis에 저장 (임시 비활성화)
      // await cacheService.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

      // 비밀번호 제거하고 응답
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: '로그인 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    }
  }

  /**
   * 토큰 갱신
   */
  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_REQUIRED',
            message: '리프레시 토큰이 필요합니다.',
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      // 토큰 검증
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;

      // Redis에서 토큰 확인
      // const storedToken = await cacheService.get(`refresh_token:${decoded.userId}`);
      const storedToken = null; // 임시 비활성화
      if (storedToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: '유효하지 않은 리프레시 토큰입니다.',
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      // 사용자 조회
      const user = await User.query().findById(decoded.userId);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자를 찾을 수 없습니다.',
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      // 새 액세스 토큰 생성
      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_ERROR',
          message: '토큰 갱신 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    }
  }

  /**
   * 로그아웃
   */
  static async logout(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (userId) {
        // Redis에서 리프레시 토큰 삭제
        // await cacheService.del(`refresh_token:${userId}`); // 임시 비활성화
      }

      res.json({
        success: true,
        data: {
          message: '로그아웃되었습니다.',
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: '로그아웃 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      const user = await User.query().findById(userId!);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자를 찾을 수 없습니다.',
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      // 비밀번호 제거하고 응답
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USER_ERROR',
          message: '사용자 정보 조회 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    }
  }

  /**
   * 사용자 프로필 업데이트 (온보딩 정보 포함)
   */
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const {
        name,
        phone_number,
        birth_date,
        gender,
        preferences,
        timezone,
        language
      } = req.body;

      const user = await User.query().findById(userId!);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자를 찾을 수 없습니다.',
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      // 업데이트할 데이터 준비
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (phone_number !== undefined) updateData.phone_number = phone_number;
      if (birth_date !== undefined) updateData.birth_date = birth_date;
      if (gender !== undefined) updateData.gender = gender;
      if (preferences !== undefined) updateData.preferences = preferences;
      if (timezone !== undefined) updateData.timezone = timezone;
      if (language !== undefined) updateData.language = language;

      // 사용자 정보 업데이트
      const updatedUser = await User.query().patchAndFetchById(userId!, updateData);

      // preferences에 예산 정보가 있으면 budgets 테이블에 실제 예산 생성
      if (preferences && preferences.budget && preferences.budget.monthlyBudget) {
        console.log('예산 정보 발견, budgets 테이블에 레코드 생성:', preferences.budget.monthlyBudget);

        // 기존 예산이 있는지 확인
        const existingBudget = await Budget.query()
          .where('user_id', userId!.toString())
          .where('category', 'TOTAL')
          .where('period', 'monthly')
          .first();

        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        if (existingBudget) {
          // 기존 예산 업데이트
          await Budget.query()
            .patchAndFetchById(existingBudget.id, {
              amount: parseInt(preferences.budget.monthlyBudget),
              start_date: now.toISOString().split('T')[0],
              end_date: endOfMonth.toISOString().split('T')[0],
              is_active: true,
            });
          console.log('기존 예산 업데이트됨:', existingBudget.id);
        } else {
          // 새 예산 생성
          const newBudget = await Budget.query().insert({
            user_id: userId!.toString(),
            name: '월 총 예산',
            amount: parseInt(preferences.budget.monthlyBudget),
            category: 'TOTAL',
            period: 'monthly',
            start_date: now.toISOString().split('T')[0],
            end_date: endOfMonth.toISOString().split('T')[0],
            alert_threshold: 80,
            is_active: true,
            auto_renew: true,
            description: '월 전체 지출 예산',
          });
          console.log('새 예산 생성됨:', newBudget.id);
        }
      }

      // 비밀번호 제거하고 응답
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_PROFILE_ERROR',
          message: '프로필 업데이트 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    }
  }
}