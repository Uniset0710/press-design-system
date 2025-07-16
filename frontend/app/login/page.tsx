'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { sanitizeInput, validateEmail } from '@/utils/security';
import { logUserLogin } from '@/utils/audit';

export default function LoginPage() {
  const [userInfo, setUserInfo] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: 'username' | 'password', value: string) => {
    // 입력값 정리 및 검증
    const sanitizedValue = sanitizeInput(value);
    
    setUserInfo(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 입력값 검증
      if (!userInfo.username.trim() || !userInfo.password.trim()) {
        throw new Error('사용자명과 비밀번호를 모두 입력해주세요.');
      }

      // 사용자명이 이메일인 경우 이메일 형식 검증
      if (userInfo.username.includes('@') && !validateEmail(userInfo.username)) {
        throw new Error('올바른 이메일 형식을 입력해주세요.');
      }

      // SQL Injection 방어
      if (userInfo.username.length > 50 || userInfo.password.length > 100) {
        throw new Error('입력값이 너무 깁니다.');
      }

      const res = await signIn('credentials', {
        redirect: false,
        username: userInfo.username,
        password: userInfo.password,
      });

      if (res?.error) {
        // 로그인 실패 로그
        logUserLogin('unknown', userInfo.username, false, res.error);
        setError('사용자명 또는 비밀번호가 올바르지 않습니다.');
      } else {
        // 로그인 성공 로그
        logUserLogin('success', userInfo.username, true);
        router.push('/model-select');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
      logUserLogin('unknown', userInfo.username, false, errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gray-50'>
      <div className='w-full max-w-sm bg-white p-8 rounded-lg shadow-lg'>
        <h1 className='text-2xl font-bold mb-6 text-center text-gray-800'>로그인</h1>
        
        {error && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded' data-testid="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              사용자명 또는 이메일
            </label>
            <input
              type='text'
              value={userInfo.username}
              onChange={e => handleInputChange('username', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
              data-testid="email-input"
              aria-label="사용자명 또는 이메일을 입력하세요"
              maxLength={50}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              비밀번호
            </label>
            <input
              type='password'
              value={userInfo.password}
              onChange={e => handleInputChange('password', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              required
              data-testid="password-input"
              aria-label="비밀번호를 입력하세요"
              maxLength={100}
              disabled={isLoading}
            />
          </div>
          
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            data-testid="login-button"
            disabled={isLoading}
            aria-label="로그인 버튼"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className='mt-6 text-center text-sm text-gray-600'>
          <p>보안을 위해 로그인 시도가 기록됩니다.</p>
          <div className='mt-4'>
            <button
              type='button'
              onClick={() => router.push('/password/forgot')}
              className='text-blue-600 hover:text-blue-800 underline'
              aria-label="비밀번호 찾기"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
