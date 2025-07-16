'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Model } from '@/types/model';
import { setModelCookies, getModelFromCookies } from '@/utils/cookieUtils';
import PermissionGuard from '@/app/components/PermissionGuard';

interface CreateModelForm {
  name: string;
  code: string;
  description: string;
}

interface EditModelForm {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export default function ModelSelectPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [createForm, setCreateForm] = useState<CreateModelForm>({
    name: '',
    code: '',
    description: ''
  });
  const [editForm, setEditForm] = useState<EditModelForm>({
    name: '',
    code: '',
    description: '',
    isActive: true
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // 드래그 앤 드롭 관련 상태
  const [draggedModel, setDraggedModel] = useState<Model | null>(null);
  const [dragOverModel, setDragOverModel] = useState<Model | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const router = useRouter();
  const { data: session, status } = useSession();

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 페이지 외부 클릭 시 드롭다운 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[id^="menu-"]') && !target.closest('button')) {
        document.querySelectorAll('[id^="menu-"]').forEach(menu => {
          (menu as HTMLElement).style.display = 'none';
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // 기종 목록 가져오기
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/models', {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.accessToken && { Authorization: `Bearer ${session.accessToken}` }),
          },
        });

        if (!response.ok) {
          throw new Error('기종 목록을 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '기종 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchModels();
    }
  }, [session, status]);

  const handleModelSelect = async (model: Model) => {
    try {
      // 선택한 기종 정보를 쿠키에 저장
      setModelCookies({
        id: model.id.toString(),
        name: model.name,
        code: model.code
      });
      
      // 해당 기종의 메인페이지로 이동
      router.push(`/model/${model.code}`);
    } catch (err) {
      setError('기종 선택 중 오류가 발생했습니다.');
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name || !createForm.code) {
      setError('기종명과 코드는 필수입니다.');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && { Authorization: `Bearer ${session.accessToken}` }),
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '기종 생성에 실패했습니다.');
      }

      const newModel = await response.json();
      setModels(prev => [...prev, newModel]);
      setShowCreateModal(false);
      setCreateForm({ name: '', code: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : '기종 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const handleEditModel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingModel || !editForm.name || !editForm.code) {
      setError('기종명과 코드는 필수입니다.');
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(`/api/models/${editingModel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && { Authorization: `Bearer ${session.accessToken}` }),
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '기종 수정에 실패했습니다.');
      }

      const updatedModel = await response.json();
      setModels(prev => prev.map(model => model.id === editingModel.id ? updatedModel : model));
      
      // 현재 선택된 모델이 수정된 경우 쿠키 업데이트 (코드는 변경되지 않음)
      const currentModelInfo = getModelFromCookies();
      if (currentModelInfo.id === editingModel.id.toString()) {
        // 쿠키 업데이트 (코드는 그대로 유지)
        setModelCookies({
          id: updatedModel.id.toString(),
          name: updatedModel.name,
          code: updatedModel.code // 코드는 변경되지 않음
        });
      }
      
      setShowEditModal(false);
      setEditingModel(null);
      setEditForm({ name: '', code: '', description: '', isActive: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '기종 수정에 실패했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteModel = async (model: Model) => {
    if (!confirm(`정말로 "${model.name}" 기종을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/models/${model.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && { Authorization: `Bearer ${session.accessToken}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '기종 삭제에 실패했습니다.');
      }

      setModels(prev => prev.filter(m => m.id !== model.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '기종 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (model: Model) => {
    setEditingModel(model);
    setEditForm({
      name: model.name,
      code: model.code,
      description: model.description || '',
      isActive: model.isActive
    });
    setShowEditModal(true);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, model: Model) => {
    if (!isAdmin) return;
    console.log('드래그 시작:', model.name);
    setDraggedModel(model);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', model.id.toString());
  };

  const handleDragOver = (e: React.DragEvent, model: Model) => {
    if (!isAdmin || !draggedModel) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverModel(model);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isAdmin) return;
    setDragOverModel(null);
  };

  const handleDrop = (e: React.DragEvent, targetModel: Model) => {
    if (!isAdmin || !draggedModel || draggedModel.id === targetModel.id) return;
    e.preventDefault();
    e.stopPropagation(); // 이벤트 버블링 방지
    
    console.log('카드 드롭:', draggedModel.name, '->', targetModel.name);
    
    // 모델 순서 변경
    const draggedIndex = models.findIndex(m => m.id === draggedModel.id);
    const targetIndex = models.findIndex(m => m.id === targetModel.id);
    
    const newModels = [...models];
    const [draggedItem] = newModels.splice(draggedIndex, 1);
    newModels.splice(targetIndex, 0, draggedItem);
    
    setModels(newModels);
    setDraggedModel(null);
    setDragOverModel(null);
    setIsDragging(false);
    
    // 서버에 새로운 순서 저장
    saveModelOrder(newModels);
  };

  const handleDragEnd = () => {
    if (!isAdmin) return;
    console.log('드래그 종료');
    setDraggedModel(null);
    setDragOverModel(null);
    setIsDragging(false);
  };

  // 모델 순서를 서버에 저장하는 함수
  const saveModelOrder = async (newModels: Model[]) => {
    try {
      const modelIds = newModels.map(model => model.id);
      
      const response = await fetch('/api/models/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken && { Authorization: `Bearer ${session.accessToken}` }),
        },
        body: JSON.stringify({ modelIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '모델 순서 저장에 실패했습니다.');
      }

      console.log('모델 순서 저장 완료');
    } catch (err) {
      console.error('모델 순서 저장 실패:', err);
      setError(err instanceof Error ? err.message : '모델 순서 저장에 실패했습니다.');
    }
  };

  const isAdmin = (session?.user as any)?.role === 'admin';

  // 디버깅을 위한 세션 정보 출력
  useEffect(() => {
    if (session) {
      console.log('🔍 현재 세션 정보:', session);
      console.log('🔍 사용자 정보:', session.user);
      console.log('🔍 사용자 역할:', (session.user as any)?.role);
      console.log('🔍 관리자 여부:', isAdmin);
    }
  }, [session, isAdmin]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">기종 선택</h1>
          <p className="text-gray-600">작업할 기종을 선택해주세요</p>
        </div>

        {/* 관리자용 기종 추가 버튼 */}
        <PermissionGuard requiredRole="admin">
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>새 기종 추가</span>
            </button>
          </div>
        </PermissionGuard>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="text-lg">기종 목록을 불러오는 중...</div>
          </div>
        ) : (
          <div 
            className="flex flex-wrap gap-6"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (!isAdmin || !draggedModel) return;
              
              // 카드 위에 드롭된 경우는 무시 (카드의 onDrop에서 처리)
              const target = e.target as HTMLElement;
              if (target.closest('[data-model-id]')) {
                return;
              }
              
              console.log('빈 공간 드롭 감지됨');
              
              // 마우스 위치를 기반으로 드롭 위치 계산
              const container = e.currentTarget;
              const rect = container.getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const mouseY = e.clientY - rect.top;
              
              // 카드 크기와 간격을 고려한 위치 계산
              const cardWidth = 320; // md:w-80 = 320px
              const cardHeight = 200; // 예상 카드 높이
              const gap = 24; // gap-6 = 24px
              
              const cardsPerRow = Math.floor((rect.width + gap) / (cardWidth + gap));
              const row = Math.floor(mouseY / (cardHeight + gap));
              const col = Math.floor(mouseX / (cardWidth + gap));
              
              const targetIndex = row * cardsPerRow + col;
              const clampedIndex = Math.min(Math.max(targetIndex, 0), models.length);
              
              console.log('빈 공간 드롭:', { mouseX, mouseY, row, col, targetIndex, clampedIndex });
              
              // 모델 순서 변경
              const newModels = [...models];
              const draggedIndex = newModels.findIndex(m => m.id === draggedModel.id);
              if (draggedIndex !== -1) {
                const [draggedItem] = newModels.splice(draggedIndex, 1);
                newModels.splice(clampedIndex, 0, draggedItem);
                setModels(newModels);
                
                // 서버에 새로운 순서 저장
                saveModelOrder(newModels);
              }
              
              setDraggedModel(null);
              setDragOverModel(null);
              setIsDragging(false);
            }}
          >
            {models.map((model) => (
              <div
                key={model.id}
                data-model-id={model.id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 relative group w-full md:w-80 lg:w-72 ${
                  draggedModel?.id === model.id ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverModel?.id === model.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                } ${
                  isDragging && draggedModel?.id !== model.id ? 'cursor-grab' : ''
                }`}
                draggable={false}
                onDragOver={(e) => handleDragOver(e, model)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, model)}
              >
                {/* 옵션 메뉴 버튼 (관리자만 표시) */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // 다른 모든 메뉴 닫기
                          document.querySelectorAll('[id^="menu-"]').forEach(menu => {
                            if (menu.id !== `menu-${model.id}`) {
                              (menu as HTMLElement).style.display = 'none';
                            }
                          });
                          
                          const menu = document.getElementById(`menu-${model.id}`);
                          if (menu) {
                            const isVisible = menu.style.display === 'block';
                            menu.style.display = isVisible ? 'none' : 'block';
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      
                      {/* 드롭다운 메뉴 */}
                      <div
                        id={`menu-${model.id}`}
                        className="hidden bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-10 absolute right-0 top-full mt-1"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(`menu-${model.id}`)!.style.display = 'none';
                            openEditModal(model);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          수정
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(`menu-${model.id}`)!.style.display = 'none';
                            handleDeleteModel(model);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 모델 카드 내용 */}
                <div
                  className={`p-6 cursor-pointer ${
                    isDragging && draggedModel?.id !== model.id ? 'cursor-grab' : ''
                  }`}
                  onClick={(e) => {
                    // 드래그 중이거나 드래그 핸들에서 클릭한 경우 선택하지 않음
                    if (isDragging || (e.target as HTMLElement).closest('.drag-handle')) {
                      return;
                    }
                    handleModelSelect(model);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleModelSelect(model);
                    }
                  }}
                  aria-label={`${model.name} 기종 선택`}
                >
                  {/* 드래그 핸들 영역 (관리자만 표시) */}
                  {isAdmin && (
                    <div 
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity drag-handle"
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, model)}
                      onDragEnd={handleDragEnd}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center cursor-grab">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {model.name}
                    </h3>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {model.code.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  {model.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {model.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      코드: {model.code}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        model.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && models.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              등록된 기종이 없습니다.
            </div>
            <p className="text-gray-400">
              관리자에게 문의하여 기종을 등록해주세요.
            </p>
          </div>
        )}
      </div>

      {/* 기종 추가 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">새 기종 추가</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateModel}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기종명 *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 중형 프레스"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기종 코드 *
                  </label>
                  <input
                    type="text"
                    value={createForm.code}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: MEDIUM_PRESS"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="기종에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? '생성 중...' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 기종 수정 모달 */}
      {showEditModal && editingModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">기종 수정</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingModel(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditModel}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기종명 *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 중형 프레스"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기종 코드 *
                  </label>
                  <input
                    type="text"
                    value={editForm.code}
                    onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 cursor-not-allowed"
                    placeholder="예: MEDIUM_PRESS"
                    required
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ 기종 코드는 데이터베이스 필터링에 사용되므로 수정할 수 없습니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="기종에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">활성 상태</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingModel(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? '수정 중...' : '수정'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 