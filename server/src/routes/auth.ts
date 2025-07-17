import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { LoginRequest } from '../types';
import { AppDataSource } from '../database';
import { User } from '../entities/User';
import { PasswordResetToken } from '../entities/PasswordResetToken';
import { EmailService } from '../utils/emailService';

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

// 비밀번호 재설정 이메일 발송
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log('🔍 Forgot password request for:', email);

    if (!email) {
      console.log('❌ No username provided');
      return res.status(400).json({ error: '사용자명을 입력해주세요' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const tokenRepo = AppDataSource.getRepository(PasswordResetToken);

    // 사용자 조회 (사용자명으로)
    const user = await userRepo.findOne({
      where: { username: email }
    });

    console.log('🔍 User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('📧 User email:', user.email);
    }

    if (!user) {
      // 보안상 존재하지 않는 사용자라고 알리지 않음
      console.log('❌ User not found, returning success message');
      return res.status(200).json({ 
        message: '비밀번호 재설정 이메일이 발송되었습니다' 
      });
    }

    // 이메일 주소가 없으면 오류 반환
    if (!user.email) {
      console.log('❌ User has no email address');
      return res.status(400).json({ 
        error: '등록된 이메일 주소가 없습니다. 관리자에게 문의하세요.' 
      });
    }

    // 기존 토큰이 있다면 만료 처리
    await tokenRepo.delete({ userId: user.id });
    console.log('🗑️ Deleted existing tokens for user');

    // 새로운 토큰 생성
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1시간 후 만료

    // 토큰 저장
    await tokenRepo.save({
      token: resetToken,
      userId: user.id,
      expiresAt
    });
    console.log('💾 Token saved successfully');

    // 이메일 발송
    console.log('📧 Attempting to send email...');
    const emailSent = await EmailService.sendPasswordResetEmail(
      user.email,
      user.username,
      resetToken
    );

    console.log('📧 Email sent result:', emailSent);

    if (!emailSent) {
      console.log('❌ Email sending failed');
      return res.status(500).json({ 
        error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' 
      });
    }

    console.log('✅ Email sent successfully');
    return res.status(200).json({ 
      message: '비밀번호 재설정 이메일이 발송되었습니다' 
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return res.status(500).json({ 
      error: '비밀번호 재설정 요청 중 오류가 발생했습니다' 
    });
  }
});

// 비밀번호 재설정 토큰 검증
router.post('/validate-reset-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: '토큰이 필요합니다' });
    }

    const tokenRepo = AppDataSource.getRepository(PasswordResetToken);
    const resetToken = await tokenRepo.findOne({
      where: { token },
      relations: ['user']
    });

    if (!resetToken) {
      return res.status(400).json({ error: '유효하지 않은 토큰입니다' });
    }

    if (resetToken.expiresAt < new Date()) {
      await tokenRepo.delete({ id: resetToken.id });
      return res.status(400).json({ error: '만료된 토큰입니다' });
    }

    return res.status(200).json({ 
      valid: true,
      userId: resetToken.userId 
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ 
      error: '토큰 검증 중 오류가 발생했습니다' 
    });
  }
});

// 비밀번호 재설정
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: '토큰과 새 비밀번호가 필요합니다' });
    }

    const tokenRepo = AppDataSource.getRepository(PasswordResetToken);
    const userRepo = AppDataSource.getRepository(User);

    const resetToken = await tokenRepo.findOne({
      where: { token },
      relations: ['user']
    });

    if (!resetToken) {
      return res.status(400).json({ error: '유효하지 않은 토큰입니다' });
    }

    if (resetToken.expiresAt < new Date()) {
      await tokenRepo.delete({ id: resetToken.id });
      return res.status(400).json({ error: '만료된 토큰입니다' });
    }

    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 사용자 비밀번호 업데이트
    await userRepo.update(resetToken.userId, { password: hashedPassword });

    // 토큰 삭제
    await tokenRepo.delete({ id: resetToken.id });

    return res.status(200).json({ 
      message: '비밀번호가 성공적으로 변경되었습니다' 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ 
      error: '비밀번호 재설정 중 오류가 발생했습니다' 
    });
  }
});

export default router;
