import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateEmail, sanitizeInput } from '@/utils/security';
import { logSecurityEvent } from '@/utils/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // 이메일 검증
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요' },
        { status: 400 }
      );
    }

    // 입력값 정리
    const sanitizedEmail = sanitizeInput(email);

    // 데이터베이스에서 사용자 조회
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: sanitizedEmail },
          { username: sanitizedEmail }
        ]
      },
      select: { id: true, email: true, username: true }
    });

    if (!user) {
      await prisma.$disconnect();
      
      // 보안 이벤트 로그 (존재하지 않는 이메일)
      logSecurityEvent('password_reset_request_failed', {
        email: sanitizedEmail,
        reason: 'user_not_found'
      }, 'low');

      // 보안상 존재하지 않는 사용자라고 알리지 않음
      return NextResponse.json(
        { message: '비밀번호 재설정 이메일이 발송되었습니다' },
        { status: 200 }
      );
    }

    // 기존 토큰이 있다면 만료 처리
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // 새로운 토큰 생성
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1시간 후 만료

    // 토큰 저장
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt
      }
    });

    await prisma.$disconnect();

    // 이메일 발송 (실제 구현에서는 이메일 서비스 사용)
    const resetUrl = `${process.env.NEXTAUTH_URL}/password/reset?token=${resetToken}`;
    
    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('Password reset URL:', resetUrl);
    }

    // 성공 로그
    logSecurityEvent('password_reset_request_success', {
      userId: user.id,
      email: user.email
    }, 'low');

    return NextResponse.json(
      { message: '비밀번호 재설정 이메일이 발송되었습니다' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    
    // 보안 이벤트 로그
    logSecurityEvent('password_reset_request_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'high');

    return NextResponse.json(
      { error: '비밀번호 재설정 요청 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 