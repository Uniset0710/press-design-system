import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginRequest } from '../types';
import { AppDataSource } from '../database';
import { User } from '../entities/User';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as LoginRequest;
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ username });
  if (!user) {
    return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
});

export default router;
