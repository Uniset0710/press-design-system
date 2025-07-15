import { toast } from 'react-hot-toast';
import { 
  Model, 
  Option, 
  CreateModelRequest, 
  UpdateModelRequest, 
  CreateOptionRequest, 
  UpdateOptionRequest, 
  ReorderOptionsRequest 
} from '../types/model';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

// 인증 헤더 가져오기
const getAuthHeaders = async () => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// 기종 관련 API
export const modelApi = {
  // 기종 목록 조회
  getModels: async (): Promise<Model[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/models`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('기종 목록을 불러오는데 실패했습니다.');
      throw error;
    }
  },

  // 기종 생성
  createModel: async (data: CreateModelRequest): Promise<Model> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/models`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create model');
      }

      toast.success('기종이 성공적으로 생성되었습니다.');
      return response.json();
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('기종 생성에 실패했습니다.');
      throw error;
    }
  },

  // 기종 수정
  updateModel: async (id: number, data: UpdateModelRequest): Promise<Model> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/models/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update model');
      }

      toast.success('기종이 성공적으로 수정되었습니다.');
      return response.json();
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('기종 수정에 실패했습니다.');
      throw error;
    }
  },

  // 기종 삭제
  deleteModel: async (id: number): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/models/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete model');
      }

      toast.success('기종이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('기종 삭제에 실패했습니다.');
      throw error;
    }
  },
};

// 옵션 관련 API
export const optionApi = {
  // 기종별 옵션 목록 조회
  getOptions: async (modelId: string): Promise<Option[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/options?modelId=${modelId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch options');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching options:', error);
      toast.error('옵션 목록을 불러오는데 실패했습니다.');
      throw error;
    }
  },

  // 옵션 생성
  createOption: async (data: CreateOptionRequest): Promise<Option> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/options`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create option');
      }

      toast.success('옵션이 성공적으로 생성되었습니다.');
      return response.json();
    } catch (error) {
      console.error('Error creating option:', error);
      toast.error('옵션 생성에 실패했습니다.');
      throw error;
    }
  },

  // 옵션 수정
  updateOption: async (id: number, data: UpdateOptionRequest): Promise<Option> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/options/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update option');
      }

      toast.success('옵션이 성공적으로 수정되었습니다.');
      return response.json();
    } catch (error) {
      console.error('Error updating option:', error);
      toast.error('옵션 수정에 실패했습니다.');
      throw error;
    }
  },

  // 옵션 삭제
  deleteOption: async (id: number): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/options/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete option');
      }

      toast.success('옵션이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error('옵션 삭제에 실패했습니다.');
      throw error;
    }
  },

  // 옵션 순서 변경
  reorderOptions: async (data: ReorderOptionsRequest): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/options/reorder`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder options');
      }

      toast.success('옵션 순서가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('Error reordering options:', error);
      toast.error('옵션 순서 변경에 실패했습니다.');
      throw error;
    }
  },
}; 