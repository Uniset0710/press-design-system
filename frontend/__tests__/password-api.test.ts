import { NextRequest } from 'next/server';
import { POST as changePasswordHandler } from '../app/api/auth/change-password/route';
import { POST as forgotPasswordHandler } from '../app/api/auth/forgot-password/route';
import { POST as resetPasswordHandler } from '../app/api/auth/reset-password/route';
import { GET as validateTokenHandler } from '../app/api/auth/validate-reset-token/route';

// Mock database and email functions
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  })),
}));

describe('Password API Endpoints', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          currentPassword: 'CurrentPass123!',
          newPassword: 'NewStrongPass123!',
        }),
      });

      const response = await changePasswordHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('비밀번호가 성공적으로 변경되었습니다');
    });

    it('should return error for invalid current password', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          currentPassword: 'WrongPass123!',
          newPassword: 'NewStrongPass123!',
        }),
      });

      const response = await changePasswordHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('현재 비밀번호가 올바르지 않습니다');
    });

    it('should return error for weak new password', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        body: JSON.stringify({
          currentPassword: 'CurrentPass123!',
          newPassword: 'weak',
        }),
      });

      const response = await changePasswordHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('비밀번호는 최소 8자 이상이어야 합니다');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset email successfully', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testuser',
        }),
      });

      const response = await forgotPasswordHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('비밀번호 재설정 이메일이 발송되었습니다');
    });

    it('should return success for non-existent user (security)', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent',
        }),
      });

      const response = await forgotPasswordHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('비밀번호 재설정 이메일이 발송되었습니다');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'valid-token',
          newPassword: 'NewStrongPass123!',
        }),
      });

      const response = await resetPasswordHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('비밀번호가 성공적으로 재설정되었습니다');
    });

    it('should return error for invalid token', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'invalid-token',
          newPassword: 'NewStrongPass123!',
        }),
      });

      const response = await resetPasswordHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 토큰입니다');
    });

    it('should return error for expired token', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'expired-token',
          newPassword: 'NewStrongPass123!',
        }),
      });

      const response = await resetPasswordHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('만료된 토큰입니다');
    });
  });

  describe('GET /api/auth/validate-reset-token', () => {
    it('should validate token successfully', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/validate-reset-token?token=valid-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await validateTokenHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(true);
      expect(data.userId).toBe('1');
    });

    it('should return error for invalid token', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/validate-reset-token?token=invalid-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await validateTokenHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 토큰입니다');
    });

    it('should return error for missing token', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/auth/validate-reset-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await validateTokenHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('토큰이 필요합니다');
    });
  });
}); 