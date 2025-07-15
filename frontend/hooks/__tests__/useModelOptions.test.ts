import { renderHook, act, waitFor } from '@testing-library/react';
import { useModels, useOptions } from '../useModelOptions';
import { modelApi, optionApi } from '../../lib/modelApi';

// Mock the API functions
jest.mock('../../lib/modelApi', () => ({
  modelApi: {
    getModels: jest.fn(),
    createModel: jest.fn(),
    updateModel: jest.fn(),
    deleteModel: jest.fn(),
  },
  optionApi: {
    getOptions: jest.fn(),
    createOption: jest.fn(),
    updateOption: jest.fn(),
    deleteOption: jest.fn(),
    reorderOptions: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useModels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch models on mount', async () => {
    const mockModels = [
      { id: 1, name: 'Press A', code: 'PRESS_A', isActive: true },
      { id: 2, name: 'Press B', code: 'PRESS_B', isActive: true },
    ];

    (modelApi.getModels as jest.Mock).mockResolvedValue(mockModels);

    const { result } = renderHook(() => useModels());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual(mockModels);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch models';
    (modelApi.getModels as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.models).toEqual([]);
  });

  it('should create model successfully', async () => {
    const mockModels = [{ id: 1, name: 'Press A', code: 'PRESS_A', isActive: true }];
    const newModel = { id: 2, name: 'Press B', code: 'PRESS_B', isActive: true };

    (modelApi.getModels as jest.Mock).mockResolvedValue(mockModels);
    (modelApi.createModel as jest.Mock).mockResolvedValue(newModel);

    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createModel({ name: 'Press B', code: 'PRESS_B' });
    });

    expect(result.current.models).toHaveLength(2);
    expect(result.current.models).toContainEqual(newModel);
  });

  it('should update model successfully', async () => {
    const mockModels = [{ id: 1, name: 'Press A', code: 'PRESS_A', isActive: true }];
    const updatedModel = { id: 1, name: 'Press A Updated', code: 'PRESS_A', isActive: true };

    (modelApi.getModels as jest.Mock).mockResolvedValue(mockModels);
    (modelApi.updateModel as jest.Mock).mockResolvedValue(updatedModel);

    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateModel(1, { name: 'Press A Updated' });
    });

    expect(result.current.models[0]).toEqual(updatedModel);
  });

  it('should delete model successfully', async () => {
    const mockModels = [{ id: 1, name: 'Press A', code: 'PRESS_A', isActive: true }];

    (modelApi.getModels as jest.Mock).mockResolvedValue(mockModels);
    (modelApi.deleteModel as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteModel(1);
    });

    expect(result.current.models).toHaveLength(0);
  });
});

describe('useOptions', () => {
  const modelId = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch options for a model', async () => {
    const mockOptions = [
      { id: 1, modelId: '1', name: 'DTL', code: 'DTL', order: 1, isActive: true },
      { id: 2, modelId: '1', name: 'DTE', code: 'DTE', order: 2, isActive: true },
    ];

    (optionApi.getOptions as jest.Mock).mockResolvedValue(mockOptions);

    const { result } = renderHook(() => useOptions(modelId));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.options).toEqual(mockOptions);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch options when modelId is empty', () => {
    const { result } = renderHook(() => useOptions(''));

    expect(result.current.loading).toBe(false);
    expect(result.current.options).toEqual([]);
    expect(optionApi.getOptions).not.toHaveBeenCalled();
  });

  it('should create option successfully', async () => {
    const mockOptions = [{ id: 1, modelId: '1', name: 'DTL', code: 'DTL', order: 1, isActive: true }];
    const newOption = { id: 2, modelId: '1', name: 'DTE', code: 'DTE', order: 2, isActive: true };

    (optionApi.getOptions as jest.Mock).mockResolvedValue(mockOptions);
    (optionApi.createOption as jest.Mock).mockResolvedValue(newOption);

    const { result } = renderHook(() => useOptions(modelId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createOption({ modelId: '1', name: 'DTE', code: 'DTE' });
    });

    expect(result.current.options).toHaveLength(2);
    expect(result.current.options).toContainEqual(newOption);
  });

  it('should update option successfully', async () => {
    const mockOptions = [{ id: 1, modelId: '1', name: 'DTL', code: 'DTL', order: 1, isActive: true }];
    const updatedOption = { id: 1, modelId: '1', name: 'DTL Updated', code: 'DTL', order: 1, isActive: true };

    (optionApi.getOptions as jest.Mock).mockResolvedValue(mockOptions);
    (optionApi.updateOption as jest.Mock).mockResolvedValue(updatedOption);

    const { result } = renderHook(() => useOptions(modelId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateOption(1, { name: 'DTL Updated' });
    });

    expect(result.current.options[0]).toEqual(updatedOption);
  });

  it('should delete option successfully', async () => {
    const mockOptions = [{ id: 1, modelId: '1', name: 'DTL', code: 'DTL', order: 1, isActive: true }];

    (optionApi.getOptions as jest.Mock).mockResolvedValue(mockOptions);
    (optionApi.deleteOption as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOptions(modelId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteOption(1);
    });

    expect(result.current.options).toHaveLength(0);
  });

  it('should reorder options successfully', async () => {
    const mockOptions = [
      { id: 1, modelId: '1', name: 'DTL', code: 'DTL', order: 1, isActive: true },
      { id: 2, modelId: '1', name: 'DTE', code: 'DTE', order: 2, isActive: true },
    ];

    (optionApi.getOptions as jest.Mock).mockResolvedValue(mockOptions);
    (optionApi.reorderOptions as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOptions(modelId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.reorderOptions([2, 1]);
    });

    expect(optionApi.reorderOptions).toHaveBeenCalledWith({
      modelId: '1',
      optionIds: [2, 1],
    });
  });
}); 