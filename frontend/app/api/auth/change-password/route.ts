import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validatePassword, sanitizeInput } from '@/utils/security';
import { logSecurityEvent } from '@/utils/audit';

export async function POST(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // 입력값 검증
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요' },
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
    const sanitizedCurrentPassword = sanitizeInput(currentPassword);
    const sanitizedNewPassword = sanitizeInput(newPassword);

    // 데이터베이스에서 사용자 정보 조회
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });

    if (!user) {
      await prisma.$disconnect();
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(sanitizedCurrentPassword, user.password);
    if (!isCurrentPasswordValid) {
      await prisma.$disconnect();
      
      // 보안 이벤트 로그
      logSecurityEvent('password_change_failed', {
        userId: session.user.id,
        reason: 'incorrect_current_password'
      }, 'medium');

      return NextResponse.json(
        { error: '현재 비밀번호가 올바르지 않습니다' },
        { status: 400 }
      );
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(sanitizedNewPassword, 12);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword }
    });

    await prisma.$disconnect();

    // 성공 로그
    logSecurityEvent('password_change_success', {
      userId: session.user.id
    }, 'low');

    return NextResponse.json(
      { message: '비밀번호가 성공적으로 변경되었습니다' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password change error:', error);
    
    // 보안 이벤트 로그
    logSecurityEvent('password_change_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'high');

    return NextResponse.json(
      { error: '비밀번호 변경 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 