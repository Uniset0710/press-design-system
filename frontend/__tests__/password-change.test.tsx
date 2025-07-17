import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordChangePage from '../app/password/change/page';

// Mock fetch
global.fetch = jest.fn();

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next-auth/react
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

// Mock security utils
jest.mock('@/utils/security', () => ({
  validatePassword: jest.fn(),
}));

describe('Password Change Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock authenticated session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'user',
        },
        accessToken: 'valid-token',
      },
      status: 'authenticated',
    });
  });

  it('renders password change form correctly', () => {
    render(<PasswordChangePage />);

    expect(screen.getByRole('heading', { name: '비밀번호 변경' })).toBeInTheDocument();
    expect(screen.getByText('안전한 비밀번호로 변경하세요')).toBeInTheDocument();
    expect(screen.getByLabelText('현재 비밀번호')).toBeInTheDocument();
    expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument();
    expect(screen.getByLabelText('새 비밀번호 확인')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '비밀번호 변경' })).toBeInTheDocument();
  });

  it('handles successful password change', async () => {
    const { validatePassword } = require('@/utils/security');
    validatePassword.mockReturnValue({
      isValid: true,
      errors: [],
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '비밀번호가 성공적으로 변경되었습니다' }),
    });

    render(<PasswordChangePage />);

    const currentPasswordInput = screen.getByLabelText('현재 비밀번호');
    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');
    const submitButton = screen.getByRole('button', { name: '비밀번호 변경' });

    fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPass123!' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.click(submitButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/change-password', {
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
  });

  it('redirects unauthenticated users', () => {
    // Mock unauthenticated session
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<PasswordChangePage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('shows loading state during submission', async () => {
    const { validatePassword } = require('@/utils/security');
    validatePassword.mockReturnValue({
      isValid: true,
      errors: [],
    });

    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PasswordChangePage />);

    const currentPasswordInput = screen.getByLabelText('현재 비밀번호');
    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');
    const submitButton = screen.getByRole('button', { name: '비밀번호 변경' });

    fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPass123!' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('변경 중...')).toBeInTheDocument();
  });
}); 