'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getModelFromCookies } from '@/utils/cookieUtils';
import { useModelOptions } from '@/hooks/useModelOptions';
import { ModelOption } from '@/types/modelOption';
import ModelOptionEditor from '@/components/model-options/ModelOptionEditor';

interface Model {
  id: string;
  name: string;
  code: string;
}

// 세션 타입 확장
interface ExtendedSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  accessToken?: string;
}

export default function ModelOptionsPage() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('Design Check List');
  const [isLoading, setIsLoading] = useState(true);

  // 관리자 권한 체크
  useEffect(() => {
    if (session && session.user?.role !== 'admin') {
      router.push('/');
      return;
    }
    setIsLoading(false);
  }, [session, router]);

  // 기종 정보 가져오기
  useEffect(() => {
    const modelInfo = getModelFromCookies();
    if (modelInfo && modelInfo.id && modelInfo.name && modelInfo.code) {
      setSelectedModel({
        id: modelInfo.id,
        name: modelInfo.name,
        code: modelInfo.code
      });
    }
  }, []);

  // 옵션 데이터 가져오기
  const { options, loading: optionsLoading, error } = useModelOptions(
    selectedModel?.code || '',
    selectedSection
  );

  const sections = [
    'Design Check List',
    'Machining Check List', 
    'Assembly Check List'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">기종별 옵션 관리</h1>
          <p className="mt-2 text-gray-600">
            각 기종별로 체크리스트 옵션을 관리할 수 있습니다.
          </p>
        </div>

        {/* 기종 선택 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기종 선택</h2>
          {selectedModel ? (
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md">
                <span className="font-medium">{selectedModel.name}</span>
                <span className="ml-2 text-sm">({selectedModel.code})</span>
              </div>
              <button
                onClick={() => router.push('/model-select')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                기종 변경
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">기종이 선택되지 않았습니다.</p>
              <button
                onClick={() => router.push('/model-select')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                기종 선택하기
              </button>
            </div>
          )}
        </div>

        {/* 섹션 선택 */}
        {selectedModel && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">섹션 선택</h2>
            <div className="flex space-x-2">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedSection === section
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 옵션 편집기 */}
        {selectedModel && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedSection} 옵션 관리
              </h2>
            </div>
            <div className="p-6">
              <ModelOptionEditor 
                modelId={selectedModel.code} 
                section={selectedSection} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 