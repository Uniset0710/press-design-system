'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
  fallback?: ReactNode;
  modelId?: string;
}

export default function PermissionGuard({ 
  children, 
  requiredRole = 'user', 
  fallback = null,
  modelId 
}: PermissionGuardProps) {
  const { data: session, status } = useSession();

  // 로딩 중이면 로딩 표시
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // 인증되지 않은 경우
  if (status === 'unauthenticated') {
    return fallback || <div>Please log in to access this feature.</div>;
  }

  // 사용자 역할 확인
  const userRole = (session?.user as any)?.role as string;
  
  // admin 권한이 필요한 경우
  if (requiredRole === 'admin' && userRole !== 'admin') {
    return fallback || <div>Admin access required.</div>;
  }

  // 기종별 권한 체크 (향후 확장 가능)
  if (modelId && userRole !== 'admin') {
    // 여기에 기종별 권한 체크 로직 추가 가능
    // 예: 사용자가 특정 기종에 대한 접근 권한이 있는지 확인
  }

  return <>{children}</>;
} 