jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: jest.fn(() => null),
}));

import { toast } from 'react-hot-toast';
import { apiRequest, handleError, AuthError, PermissionError, ValidationError, ApiError, AppError } from '../errorHandler';

describe('Error Classes', () => {
  test('AppError should create with correct properties', () => {
    const error = new AppError('Test error', 500);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('AppError');
  });

  test('AuthError should create with redirect', () => {
    const error = new AuthError('Auth failed', '/login');
    expect(error.message).toBe('Auth failed');
    expect(error.redirectTo).toBe('/login');
    expect(error.name).toBe('AuthError');
  });

  test('PermissionError should create with correct properties', () => {
    const error = new PermissionError('No permission');
    expect(error.message).toBe('No permission');
    expect(error.name).toBe('PermissionError');
  });

  test('ValidationError should create with correct properties', () => {
    const error = new ValidationError('Invalid input');
    expect(error.message).toBe('Invalid input');
    expect(error.name).toBe('ValidationError');
  });

  test('ApiError should create with correct properties', () => {
    const error = new ApiError('API error', 400, '/api/test');
    expect(error.message).toBe('API error');
    expect(error.statusCode).toBe(400);
    expect(error.url).toBe('/api/test');
    expect(error.name).toBe('ApiError');
  });
});

describe('handleError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle AuthError with redirect', () => {
    const error = new AuthError('Auth failed', '/login');
    // window.location.href 할당이 에러 없이 실행되는지만 확인
    expect(() => handleError(error)).not.toThrow();
    expect(toast.error).toHaveBeenCalledWith('Auth failed');
  });

  test('should handle PermissionError', () => {
    const error = new PermissionError('No permission');
    handleError(error);
    expect(toast.error).toHaveBeenCalledWith('No permission');
  });

  test('should handle ValidationError', () => {
    const error = new ValidationError('Invalid input');
    handleError(error);
    expect(toast.error).toHaveBeenCalledWith('Invalid input');
  });

  test('should handle generic Error', () => {
    const error = new Error('Generic error');
    handleError(error);
    expect(toast.error).toHaveBeenCalledWith('Generic error');
  });

  test('should handle unknown error', () => {
    handleError('Unknown error');
    expect(toast.error).toHaveBeenCalledWith('알 수 없는 오류가 발생했습니다.');
  });
});

describe('apiRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle 401 error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: async () => ({ message: 'Unauthorized' }),
    });

    await expect(apiRequest('/api/test')).rejects.toThrow('인증이 만료되었습니다');
  });

  test('should handle 403 error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 403,
      ok: false,
      json: async () => ({ message: 'Forbidden' }),
    });

    await expect(apiRequest('/api/test')).rejects.toThrow('Forbidden');
  });

  test('should handle 400 error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
      ok: false,
      json: async () => ({ error: '잘못된 요청입니다' }),
    });

    await expect(apiRequest('/api/test')).rejects.toThrow('잘못된 요청입니다');
  });

  test('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(apiRequest('/api/test')).rejects.toThrow('네트워크 오류가 발생했습니다');
  });
}); 