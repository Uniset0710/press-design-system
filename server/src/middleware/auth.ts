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

// 기종별 권한 체크 미들웨어
export const modelIdAccessMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const modelId = req.params?.modelId || req.body?.modelId || req.query?.modelId;

  // 관리자는 모든 기종에 접근 가능
  if (req.user?.role === 'admin') {
    next();
    return;
  }

  // modelId가 지정되지 않은 경우 통과
  if (!modelId) {
    next();
    return;
  }

  // 사용자가 해당 기종에 접근 권한이 있는지 확인
  // 향후 사용자별 기종 권한 테이블이 추가되면 여기서 체크
  // 현재는 모든 인증된 사용자가 모든 기종에 접근 가능
  next();
  return;
};

// 기종별 쓰기 권한 체크 미들웨어
export const modelIdWriteMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const modelId = req.params?.modelId || req.body?.modelId || req.query?.modelId;

  // 관리자는 모든 기종에 쓰기 권한
  if (req.user?.role === 'admin') {
    next();
    return;
  }

  // 일반 사용자는 쓰기 권한 없음
  res.status(403).json({ 
    message: '기종별 데이터 수정은 관리자만 가능합니다.' 
  });
  return;
};
