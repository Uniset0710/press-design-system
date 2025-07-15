import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: Omit<User, 'password'>;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: '인증이 필요합니다.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Omit<User, 'password'>;
    req.user = decoded;
    next();
    return;
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    return;
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    return;
  }
  next();
  return;
};

// 모델 기반 권한 체크 미들웨어
export const modelAccessMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userModel = req.user?.model;
  const requestModel = req.params?.model || req.body?.model || req.query?.model;

  // 관리자는 모든 모델에 접근 가능
  if (req.user?.role === 'admin') {
    next();
    return;
  }

  // 모델이 지정되지 않은 경우 기본 모델(PRESS)로 처리
  if (!requestModel) {
    next();
    return;
  }

  // 사용자가 해당 모델에 접근 권한이 있는지 확인
  if (userModel && userModel !== requestModel) {
    res.status(403).json({ 
      message: `모델 '${requestModel}'에 대한 접근 권한이 없습니다.` 
    });
    return;
  }

  next();
  return;
};

// 역할 기반 권한 체크 미들웨어
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: '인증이 필요합니다.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        message: `이 작업을 수행하려면 ${allowedRoles.join(' 또는 ')} 권한이 필요합니다.` 
      });
      return;
    }

    next();
    return;
  };
};
