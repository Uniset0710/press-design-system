import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { modelAccessMiddleware, roleMiddleware, AuthRequest } from '../../../server/src/middleware/auth';

// JWT_SECRET 환경변수 설정
process.env.JWT_SECRET = 'test-secret-key';

// Mock JWT
const mockVerify = jest.fn();
jest.mock('jsonwebtoken', () => ({
  verify: mockVerify
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 1,
        username: 'testuser',
        role: 'user',
        model: 'PRESS'
      },
      accessToken: 'mock-token'
    },
    status: 'authenticated'
  })
}));

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: {} as any,
      user: undefined,
      params: {},
      body: {},
      query: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('modelAccessMiddleware', () => {
    beforeEach(() => {
      mockRequest.user = {
        id: 1,
        username: 'testuser',
        role: 'user',
        model: 'PRESS'
      };
    });

    test('should allow admin access to any model', () => {
      mockRequest.user!.role = 'admin';
      mockRequest.params = { model: 'OTHER_MODEL' };

      modelAccessMiddleware(mockRequest as AuthRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should allow user access to their assigned model', () => {
      mockRequest.params = { model: 'PRESS' };

      modelAccessMiddleware(mockRequest as AuthRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject user access to different model', () => {
      mockRequest.params = { model: 'OTHER_MODEL' };

      modelAccessMiddleware(mockRequest as AuthRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "모델 'OTHER_MODEL'에 대한 접근 권한이 없습니다."
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should allow access when no model specified', () => {
      modelAccessMiddleware(mockRequest as AuthRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('roleMiddleware', () => {
    beforeEach(() => {
      mockRequest.user = {
        id: 1,
        username: 'testuser',
        role: 'user',
        model: 'PRESS'
      };
    });

    test('should allow user with correct role', () => {
      const middleware = roleMiddleware(['user', 'admin']);
      
      middleware(mockRequest as AuthRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject user with incorrect role', () => {
      const middleware = roleMiddleware(['admin']);
      
      middleware(mockRequest as AuthRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: '이 작업을 수행하려면 admin 권한이 필요합니다.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject when no user', () => {
      mockRequest.user = undefined;
      const middleware = roleMiddleware(['user']);
      
      middleware(mockRequest as AuthRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: '인증이 필요합니다.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 