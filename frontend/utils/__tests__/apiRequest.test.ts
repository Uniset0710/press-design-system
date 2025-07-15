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
import { apiRequest, modelApiRequest, handleError } from '../errorHandler';

describe('API Request Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('apiRequest', () => {
    test('should make successful request with session', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockSession = { accessToken: 'test-token' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: { get: () => 'application/json' },
      });

      const result = await apiRequest('/api/test', {}, mockSession);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });
    });

    test('should make request without session', async () => {
      const mockData = { id: 1, name: 'Test' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: { get: () => 'application/json' },
      });

      const result = await apiRequest('/api/test');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    test('should handle 401 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(apiRequest('/api/test')).rejects.toThrow('인증이 만료되었습니다');
    });

    test('should handle 403 error with custom message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 403,
        ok: false,
        json: async () => ({ message: 'Custom permission error' }),
      });

      await expect(apiRequest('/api/test')).rejects.toThrow('Custom permission error');
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

  describe('modelApiRequest', () => {
    test('should add model parameter to URL', async () => {
      const mockData = { id: 1, name: 'Test' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: { get: () => 'application/json' },
      });

      await modelApiRequest('/api/test', 'test-model');

      expect(global.fetch).toHaveBeenCalledWith('/api/test?model=test-model', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    test('should append model parameter to existing query string', async () => {
      const mockData = { id: 1, name: 'Test' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: { get: () => 'application/json' },
      });

      await modelApiRequest('/api/test?param=value', 'test-model');

      expect(global.fetch).toHaveBeenCalledWith('/api/test?param=value&model=test-model', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('handleError', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should handle AuthError with redirect', () => {
      const { AuthError } = require('../errorHandler');
      const error = new AuthError('Auth failed', '/login');
      // window.location.href 할당이 에러 없이 실행되는지만 확인
      expect(() => handleError(error)).not.toThrow();
      expect(toast.error).toHaveBeenCalledWith('Auth failed');
    });

    test('should handle PermissionError', () => {
      const { PermissionError } = require('../errorHandler');
      const error = new PermissionError('No permission');
      handleError(error);
      expect(toast.error).toHaveBeenCalledWith('No permission');
    });

    test('should handle ValidationError', () => {
      const { ValidationError } = require('../errorHandler');
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
}); 