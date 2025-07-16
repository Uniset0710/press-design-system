import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { validatePassword, sanitizeInput } from '@/utils/security';
import { logSecurityEvent } from '@/utils/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // 입력값 검증
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: '토큰과 새 비밀번호를 모두 입력해주세요' },
        { status: 400 }
      );
    }

    // 새 비밀번호 강도 검증
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(' ') },
        { status: 400 }
      );
    }

    // 입력값 정리
    const sanitizedNewPassword = sanitizeInput(newPassword);

    // 데이터베이스에서 토큰 조회
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { 
        token,
        expiresAt: { gt: new Date() } // 만료되지 않은 토큰만
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    if (!resetToken) {
      await prisma.$disconnect();
      
      // 보안 이벤트 로그
      logSecurityEvent('password_reset_failed', {
        token: token.substring(0, 8) + '...',
        reason: 'invalid_or_expired_token'
      }, 'medium');

      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다' },
        { status: 400 }
      );
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(sanitizedNewPassword, 12);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: resetToken.user.id },
      data: { password: hashedNewPassword }
    });

    // 사용된 토큰 삭제
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    await prisma.$disconnect();

    // 성공 로그
    logSecurityEvent('password_reset_success', {
      userId: resetToken.user.id,
      email: resetToken.user.email
    }, 'low');

    return NextResponse.json(
      { message: '비밀번호가 성공적으로 재설정되었습니다' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    
    // 보안 이벤트 로그
    logSecurityEvent('password_reset_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'high');

    return NextResponse.json(
      { error: '비밀번호 재설정 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 