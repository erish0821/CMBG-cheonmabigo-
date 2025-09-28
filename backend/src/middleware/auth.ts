import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest, ApiResponse } from '../types';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_REQUIRED',
          message: '인증이 필요합니다.',
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // JWT 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // 사용자 존재 확인
    const user = await User.query().findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.',
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      } as ApiResponse);
    }

    // 사용자 정보를 request에 추가
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);

    let errorCode = 'AUTH_ERROR';
    let errorMessage = '인증 중 오류가 발생했습니다.';

    if (error instanceof jwt.JsonWebTokenError) {
      errorCode = 'INVALID_TOKEN';
      errorMessage = '유효하지 않은 토큰입니다.';
    } else if (error instanceof jwt.TokenExpiredError) {
      errorCode = 'TOKEN_EXPIRED';
      errorMessage = '토큰이 만료되었습니다.';
    }

    return res.status(401).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
    } as ApiResponse);
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await User.query().findById(decoded.userId);
    if (user && user.is_active) {
      req.user = {
        id: user.id,
        userId: user.id,
        email: user.email,
        name: user.name,
      };
    }

    next();
  } catch (error) {
    // 선택적 인증이므로 에러가 있어도 계속 진행
    next();
  }
};