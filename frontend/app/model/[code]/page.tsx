'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageContainer from '@/app/components/PageContainer';
import { getModelFromCookies } from '@/utils/cookieUtils';

export default function ModelMainPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [modelCode, setModelCode] = useState<string>('');
  const [modelName, setModelName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && params.code) {
      const code = params.code as string;
      setModelCode(code);
      
      // 쿠키에서 모델 정보 가져오기
      const modelInfo = getModelFromCookies();
      const selectedModelCode = modelInfo.code;
      const selectedModelName = modelInfo.name;

      // URL의 모델 코드와 선택된 모델 코드가 일치하는지 확인
      if (selectedModelCode && selectedModelCode !== code) {
        // 일치하지 않으면 새로운 URL로 리다이렉트
        router.push(`/model/${selectedModelCode}`);
        return;
      }

      // 모델 정보가 없거나 코드가 일치하지 않는 경우 모델 선택 페이지로 이동
      if (!selectedModelCode) {
        router.push('/model-select');
        return;
      }

      setModelName(selectedModelName || code);
      setLoading(false);
    }
  }, [status, params.code, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // 리다이렉트 중
  }

  if (!modelCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">모델 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 기존 PageContainer 컴포넌트 사용 */}
      <PageContainer />
    </div>
  );
} 