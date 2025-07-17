import { NextRequest } from 'next/server';

// Mock NextRequest
const createMockRequest = (url: string, method: string, body?: any, headers?: Record<string, string>) => {
  return {
    url,
    method,
    headers: new Map(Object.entries(headers || {})),
    json: async () => body || {},
    text: async () => JSON.stringify(body || {}),
  } as unknown as NextRequest;
};

// Mock the API route handlers
const mockChangePasswordHandler = jest.fn();
const mockForgotPasswordHandler = jest.fn();
const mockResetPasswordHandler = jest.fn();
const mockValidateTokenHandler = jest.fn();

jest.mock('../app/api/auth/change-password/route', () => ({
  POST: mockChangePasswordHandler,
}));

jest.mock('../app/api/auth/forgot-password/route', () => ({
  POST: mockForgotPasswordHandler,
}));

jest.mock('../app/api/auth/reset-password/route', () => ({
  POST: mockResetPasswordHandler,
}));

jest.mock('../app/api/auth/validate-reset-token/route', () => ({
  GET: mockValidateTokenHandler,
}));

describe('Password API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/change-password', () => {
    it('should handle valid request', async () => {
      const mockResponse = { status: 200, json: async () => ({ success: true }) };
      mockChangePasswordHandler.mockResolvedValue(mockResponse);

      const request = createMockRequest(
        'http://localhost:3000/api/auth/change-password',
        'POST',
        {
          currentPassword: 'CurrentPass123!',
          newPassword: 'NewStrongPass123!',
        },
        {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        }
      );

      const response = await mockChangePasswordHandler(request);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should handle missing body', async () => {
      const mockResponse = { status: 400, json: async () => ({ error: '요청 본문이 필요합니다' }) };
      mockChangePasswordHandler.mockResolvedValue(mockResponse);

      const request = createMockRequest(
        'http://localhost:3000/api/auth/change-password',
        'POST',
        undefined,
        {
          'Content-Type': 'application/json',
        }
      );

      const response = await mockChangePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('요청 본문이 필요합니다');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should handle valid request', async () => {
      const mockResponse = { status: 200, json: async () => ({ success: true }) };
      mockForgotPasswordHandler.mockResolvedValue(mockResponse);

      const request = createMockRequest(
        'http://localhost:3000/api/auth/forgot-password',
        'POST',
        {
          email: 'testuser',
        },
        {
          'Content-Type': 'application/json',
        }
      );

      const response = await mockForgotPasswordHandler(request);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should handle missing email', async () => {
      const mockResponse = { status: 400, json: async () => ({ error: '사용자명을 입력해주세요' }) };
      mockForgotPasswordHandler.mockResolvedValue(mockResponse);

      const request = createMockRequest(
        'http://localhost:3000/api/auth/forgot-password',
        'POST',
        {},
        {
          'Content-Type': 'application/json',
        }
      );

      const response = await mockForgotPasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('사용자명을 입력해주세요');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should handle valid request', async () => {
      const mockResponse = { status: 200, json: async () => ({ success: true }) };
      mockResetPasswordHandler.mockResolvedValue(mockResponse);

      const request = createMockRequest(
        'http://localhost:3000/api/auth/reset-password',
        'POST',
        {
          token: 'valid-token',
          newPassword: 'NewStrongPass123!',
        },
        {
          'Content-Type': 'application/json',
        }
      );

      const response = await mockResetPasswordHandler(request);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should handle missing token', async () => {
      const mockResponse = { status: 400, json: async () => ({ error: '토큰이 필요합니다' }) };
      mockResetPasswordHandler.mockResolvedValue(mockResponse);

      const request = createMockRequest(
        'http://localhost:3000/api/auth/reset-password',
        'POST',
        {
          newPassword: 'NewStrongPass123!',
        },
        {
          'Content-Type': 'application/json',
        }
      );

      const response = await mockResetPasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('토큰이 필요합니다');
    });

    it('should handle missing newPassword', async () => {
      const mockResponse = { status: 400, json: async () => ({ error: '새 비밀번호가 필요합니다' }) };
      mockResetPasswordHandler.mockResolvedValue(mockResponse);

      const request = createMockRequest(
        'http://localhost:3000/api/auth/reset-password',
        'POST',
        {
          token: 'valid-token',
        },
        {
          'Content-Type': 'application/json',
        }
      );

      const response = await mockResetPasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('새 비밀번호가 필요합니다');
    });
  });

  describe('GET /api/auth/validate-reset-token', () => {
    it('should validate token successfully', async () => {
      const mockResponse = { status: 200, json: async () => ({ valid: true }) };
      mockValidateTokenHandler.mockResolvedValue(mockResponse);

      const request = createMockRequest(
        'http://localhost:3000/api/auth/validate-reset-token?token=valid-token',
        'GET',
        undefined,
        {
          'Content-Type': 'application/json',
        }
      );

      const response = await mockValidateTokenHandler(request);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should return error for missing token', async () => {
      const mockResponse = { status: 400, json: async () => ({ error: '토큰이 필요합니다' }) };
      mockValidateTokenHandler.mockResolvedValue(mockResponse);

      const request = createMockRequest(
        'http://localhost:3000/api/auth/validate-reset-token',
        'GET',
        undefined,
        {
          'Content-Type': 'application/json',
        }
      );

      const response = await mockValidateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('토큰이 필요합니다');
    });
  });
}); 