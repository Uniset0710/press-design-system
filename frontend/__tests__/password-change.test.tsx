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

describe('Password Change Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('validates form inputs', async () => {
    render(<PasswordChangePage />);

    const submitButton = screen.getByRole('button', { name: '비밀번호 변경' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('현재 비밀번호를 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('새 비밀번호를 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('새 비밀번호 확인을 입력해주세요')).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    render(<PasswordChangePage />);

    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const submitButton = screen.getByRole('button', { name: '비밀번호 변경' });

    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/비밀번호는 최소 8자 이상이어야 합니다/)).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    render(<PasswordChangePage />);

    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');
    const submitButton = screen.getByRole('button', { name: '비밀번호 변경' });

    fireEvent.change(newPasswordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument();
    });
  });

  it('handles successful password change', async () => {
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
      },
      body: JSON.stringify({
        currentPassword: 'CurrentPass123!',
        newPassword: 'NewStrongPass123!',
      }),
    });
  });

  it('handles API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '현재 비밀번호가 올바르지 않습니다' }),
    });

    render(<PasswordChangePage />);

    const currentPasswordInput = screen.getByLabelText('현재 비밀번호');
    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');
    const submitButton = screen.getByRole('button', { name: '비밀번호 변경' });

    fireEvent.change(currentPasswordInput, { target: { value: 'WrongPass123!' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewStrongPass123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('현재 비밀번호가 올바르지 않습니다')).toBeInTheDocument();
    });
  });

  it('redirects unauthenticated users', () => {
    // Mock useSession to return null (unauthenticated)
    jest.doMock('next-auth/react', () => ({
      useSession: () => ({ data: null, status: 'unauthenticated' }),
    }));

    render(<PasswordChangePage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
}); 