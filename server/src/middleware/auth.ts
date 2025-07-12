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
  const token = req.header('Authorization')?.replace('Bearer ', '');

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
