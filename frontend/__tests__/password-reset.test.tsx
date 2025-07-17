import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordResetPage from '../app/password/reset/page';

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
const mockGetSearchParams = jest.fn().mockReturnValue('valid-token');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGetSearchParams,
  }),
}));

describe('Password Reset Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock token validation to return valid
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, userId: '1' }),
    });
  });

  it('renders password reset form correctly', async () => {
    render(<PasswordResetPage />);

    // Wait for token validation to complete
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '새 비밀번호 설정' })).toBeInTheDocument();
    });

    expect(screen.getByText('안전한 새 비밀번호를 입력하세요')).toBeInTheDocument();
    expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument();
    expect(screen.getByLabelText('새 비밀번호 확인')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<PasswordResetPage />);

    // Wait for token validation to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('새 비밀번호를 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('새 비밀번호 확인을 입력해주세요')).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    render(<PasswordResetPage />);

    // Wait for token validation to complete
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' });

    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/비밀번호는 최소 8자 이상이어야 합니다/)).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    render(<PasswordResetPage />);

    // Wait for token validation to complete
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' });

    fireEvent.change(newPasswordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument();
    });
  });

  it('handles successful password reset', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, userId: '1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '비밀번호가 성공적으로 재설정되었습니다' }),
      });

    render(<PasswordResetPage />);

    // Wait for token validation to complete
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' });

    fireEvent.change(newPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.click(submitButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'valid-token',
        newPassword: 'NewStrongPass123!',
      }),
    });
  });

  it('handles API error', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, userId: '1' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '유효하지 않은 토큰입니다' }),
      });

    render(<PasswordResetPage />);

    // Wait for token validation to complete
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' });

    fireEvent.change(newPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('유효하지 않은 토큰입니다')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, userId: '1' }),
      })
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PasswordResetPage />);

    // Wait for token validation to complete
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' });

    fireEvent.change(newPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('재설정 중...')).toBeInTheDocument();
  });

  it('shows success message after reset', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, userId: '1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: '비밀번호가 성공적으로 재설정되었습니다' }),
      });

    render(<PasswordResetPage />);

    // Wait for token validation to complete
    await waitFor(() => {
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' });

    fireEvent.change(newPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('비밀번호 재설정 완료')).toBeInTheDocument();
      expect(screen.getByText('비밀번호가 성공적으로 재설정되었습니다')).toBeInTheDocument();
    });
  });

  it('shows invalid link message for invalid token', async () => {
    // Mock token validation to return invalid
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '유효하지 않은 토큰입니다' }),
    });

    render(<PasswordResetPage />);

    await waitFor(() => {
      expect(screen.getByText('유효하지 않은 링크')).toBeInTheDocument();
      expect(screen.getByText('비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다')).toBeInTheDocument();
    });
  });
}); 