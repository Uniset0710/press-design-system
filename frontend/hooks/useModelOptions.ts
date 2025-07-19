import { useState, useEffect, useCallback } from 'react';
import { Model, Option, CreateModelRequest, UpdateModelRequest, CreateOptionRequest, UpdateOptionRequest } from '../types/model';
import { modelApi, optionApi } from '../lib/modelApi';
import { ModelOption } from '@/types/modelOption';
import { getModelOptions } from '@/lib/modelOptionApi';

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await modelApi.getModels();
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '기종 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createModel = useCallback(async (data: CreateModelRequest) => {
    try {
      const newModel = await modelApi.createModel(data);
      setModels(prev => [...prev, newModel]);
      return newModel;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateModel = useCallback(async (id: number, data: UpdateModelRequest) => {
    try {
      const updatedModel = await modelApi.updateModel(id, data);
      setModels(prev => prev.map(model => model.id === id ? updatedModel : model));
      return updatedModel;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteModel = useCallback(async (id: number) => {
    try {
      await modelApi.deleteModel(id);
      setModels(prev => prev.filter(model => model.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    loading,
    error,
    fetchModels,
    createModel,
    updateModel,
    deleteModel,
  };
};

export const useOptions = (modelId: string) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    if (!modelId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await optionApi.getOptions(modelId);
      setOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '옵션 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  const createOption = useCallback(async (data: CreateOptionRequest) => {
    try {
      const newOption = await optionApi.createOption(data);
      setOptions(prev => [...prev, newOption]);
      return newOption;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateOption = useCallback(async (id: number, data: UpdateOptionRequest) => {
    try {
      const updatedOption = await optionApi.updateOption(id, data);
      setOptions(prev => prev.map(option => option.id === id ? updatedOption : option));
      return updatedOption;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteOption = useCallback(async (id: number) => {
    try {
      await optionApi.deleteOption(id);
      setOptions(prev => prev.filter(option => option.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  const reorderOptions = useCallback(async (optionIds: number[]) => {
    try {
      await optionApi.reorderOptions({ modelId, optionIds });
      // 순서가 변경되었으므로 다시 불러오기
      await fetchOptions();
    } catch (err) {
      throw err;
    }
  }, [modelId, fetchOptions]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    options,
    loading,
    error,
    fetchOptions,
    createOption,
    updateOption,
    deleteOption,
    reorderOptions,
  };
};

export const useModelOptions = (modelId: string, section?: string) => {
  const [options, setOptions] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOptions = useCallback(async () => {
    if (!modelId) {
      setOptions([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching options for modelId:', modelId, 'section:', section);
      const data = await getModelOptions(modelId, section);
      console.log('Received options data:', data);
      setOptions(data);
    } catch (err) {
      console.error('Error fetching options:', err);
      setError(err instanceof Error ? err.message : '옵션을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [modelId, section]);
  
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);
  
  return { options, loading, error, refetch: fetchOptions };
}; 