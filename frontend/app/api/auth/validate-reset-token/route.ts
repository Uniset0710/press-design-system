import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from '@/utils/audit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '토큰이 필요합니다' },
        { status: 400 }
      );
    }

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

    await prisma.$disconnect();

    if (!resetToken) {
      // 보안 이벤트 로그
      logSecurityEvent('password_reset_token_validation_failed', {
        token: token.substring(0, 8) + '...', // 토큰 일부만 로그
        reason: 'invalid_or_expired_token'
      }, 'medium');

      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다' },
        { status: 400 }
      );
    }

    // 성공 로그
    logSecurityEvent('password_reset_token_validation_success', {
      userId: resetToken.user.id
    }, 'low');

    return NextResponse.json(
      { 
        message: '유효한 토큰입니다',
        userId: resetToken.user.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token validation error:', error);
    
    // 보안 이벤트 로그
    logSecurityEvent('password_reset_token_validation_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'high');

    return NextResponse.json(
      { error: '토큰 검증 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 