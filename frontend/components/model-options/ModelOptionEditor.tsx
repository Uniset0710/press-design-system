'use client';

import React, { useState } from 'react';
import { ModelOption } from '@/types/modelOption';
import { useModelOptions } from '@/hooks/useModelOptions';
import { createModelOption, updateModelOption, deleteModelOption } from '@/lib/modelOptionApi';
import { toast } from 'react-hot-toast';
import DraggableOptionList from './DraggableOptionList';

interface ModelOptionEditorProps {
  modelId: string;
  section: string;
}

interface AddOptionForm {
  optionCode: string;
  optionName: string;
  isActive: boolean;
}

export default function ModelOptionEditor({ modelId, section }: ModelOptionEditorProps) {
  const { options, loading, error, refetch } = useModelOptions(modelId, section);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOption, setEditingOption] = useState<ModelOption | null>(null);
  const [formData, setFormData] = useState<AddOptionForm>({
    optionCode: '',
    optionName: '',
    isActive: true
  });

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.optionCode.trim() || !formData.optionName.trim()) {
      toast.error('옵션 코드와 이름을 입력해주세요.');
      return;
    }

    try {
      await createModelOption({
        modelId,
        section,
        optionCode: formData.optionCode.trim(),
        optionName: formData.optionName.trim(),
        order: options.length,
        isActive: formData.isActive
      });
      
      toast.success('옵션이 추가되었습니다.');
      setShowAddForm(false);
      setFormData({ optionCode: '', optionName: '', isActive: true });
      refetch();
    } catch (error) {
      toast.error('옵션 추가에 실패했습니다.');
      console.error('옵션 추가 오류:', error);
    }
  };

  const handleUpdateOption = async (id: string, updates: Partial<AddOptionForm>) => {
    try {
      await updateModelOption(id, updates);
      toast.success('옵션이 수정되었습니다.');
      setEditingOption(null);
      refetch();
    } catch (error) {
      toast.error('옵션 수정에 실패했습니다.');
      console.error('옵션 수정 오류:', error);
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm('정말로 이 옵션을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteModelOption(id);
      toast.success('옵션이 삭제되었습니다.');
      refetch();
    } catch (error) {
      toast.error('옵션 삭제에 실패했습니다.');
      console.error('옵션 삭제 오류:', error);
    }
  };

  const handleToggleActive = async (option: ModelOption) => {
    try {
      await updateModelOption(option.id, { isActive: !option.isActive });
      toast.success(`옵션이 ${!option.isActive ? '활성화' : '비활성화'}되었습니다.`);
      refetch();
    } catch (error) {
      toast.error('옵션 상태 변경에 실패했습니다.');
      console.error('옵션 상태 변경 오류:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-2">옵션을 불러오는데 실패했습니다.</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 추가 폼 */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">새 옵션 추가</h3>
          <form onSubmit={handleAddOption} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  옵션 코드
                </label>
                <input
                  type="text"
                  value={formData.optionCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, optionCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: DTL"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  옵션 이름
                </label>
                <input
                  type="text"
                  value={formData.optionName}
                  onChange={(e) => setFormData(prev => ({ ...prev, optionName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: Design Top Left"
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                활성화
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ optionCode: '', optionName: '', isActive: true });
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 옵션 목록 */}
      <div className="space-y-3">
        {options.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">등록된 옵션이 없습니다.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              첫 번째 옵션 추가
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {section} 옵션 ({options.length}개)
              </h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                새 옵션 추가
              </button>
            </div>
            
            <DraggableOptionList
              options={options}
              modelId={modelId}
              section={section}
              onEdit={setEditingOption}
              onDelete={handleDeleteOption}
              onToggleActive={handleToggleActive}
              onReorder={(newOptions) => {
                // 로컬 상태 업데이트 (refetch 대신)
                // 실제로는 refetch를 호출하는 것이 더 안전합니다
                refetch();
              }}
            />
          </>
        )}
      </div>

      {/* 수정 모달 */}
      {editingOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">옵션 수정</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateOption(editingOption.id, {
                optionCode: formData.optionCode,
                optionName: formData.optionName,
                isActive: formData.isActive
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  옵션 코드
                </label>
                <input
                  type="text"
                  value={formData.optionCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, optionCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: DTL"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  옵션 이름
                </label>
                <input
                  type="text"
                  value={formData.optionName}
                  onChange={(e) => setFormData(prev => ({ ...prev, optionName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: Design Top Left"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="editIsActive" className="ml-2 text-sm text-gray-700">
                  활성화
                </label>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingOption(null);
                    setFormData({ optionCode: '', optionName: '', isActive: true });
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 