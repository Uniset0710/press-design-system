import { ModelOption, ModelOptionForm, ReorderRequest } from '@/types/modelOption';
import { getSession } from 'next-auth/react';

export const getModelOptions = async (
  modelId: string, 
  section?: string
): Promise<ModelOption[]> => {
  const params = new URLSearchParams({ modelid: modelId });
  if (section) params.append('section', section);
  
  const session = await getSession();
  const response = await fetch(`/api/model-options?${params}`, {
    headers: {
      'Authorization': `Bearer ${session?.accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('옵션을 불러오는데 실패했습니다.');
  }
  
  return response.json();
};

export const createModelOption = async (
  option: Omit<ModelOption, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ModelOption> => {
  const session = await getSession();
  const response = await fetch('/api/model-options', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.accessToken}`,
    },
    body: JSON.stringify(option),
  });
  
  if (!response.ok) {
    throw new Error('옵션 생성에 실패했습니다.');
  }
  
  return response.json();
};

export const updateModelOption = async (
  id: string, 
  updates: Partial<ModelOptionForm>
): Promise<ModelOption> => {
  const session = await getSession();
  const response = await fetch(`/api/model-options/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.accessToken}`,
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('옵션 수정에 실패했습니다.');
  }
  
  return response.json();
};

export const deleteModelOption = async (id: string): Promise<void> => {
  const session = await getSession();
  const response = await fetch(`/api/model-options/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session?.accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('옵션 삭제에 실패했습니다.');
  }
};

export const reorderModelOptions = async (
  modelId: string, 
  section: string, 
  newOrder: string[]
): Promise<void> => {
  const session = await getSession();
  const response = await fetch('/api/model-options/reorder', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.accessToken}`,
    },
    body: JSON.stringify({ optionIds: newOrder }),
  });
  
  if (!response.ok) {
    throw new Error('옵션 순서 변경에 실패했습니다.');
  }
}; 