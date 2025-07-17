import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordForgotPage from '../app/password/forgot/page';

// Mock fetch
global.fetch = jest.fn();

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Password Forgot Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders forgot password form correctly', () => {
    render(<PasswordForgotPage />);

    expect(screen.getByText('비밀번호 찾기')).toBeInTheDocument();
    expect(screen.getByText('가입한 사용자명을 입력하세요')).toBeInTheDocument();
    expect(screen.getByLabelText('사용자명')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' })).toBeInTheDocument();
  });

  it('shows error for empty username', async () => {
    render(<PasswordForgotPage />);

    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('사용자명을 입력해주세요')).toBeInTheDocument();
    });
  });

  it('handles successful email submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '비밀번호 재설정 이메일이 발송되었습니다' }),
    });

    render(<PasswordForgotPage />);

    const usernameInput = screen.getByLabelText('사용자명');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'testuser' }),
    });
  });

  it('handles API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '이메일 발송에 실패했습니다' }),
    });

    render(<PasswordForgotPage />);

    const usernameInput = screen.getByLabelText('사용자명');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('이메일 발송에 실패했습니다')).toBeInTheDocument();
    });
  });

  it('shows success message after successful submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '비밀번호 재설정 이메일이 발송되었습니다' }),
    });

    render(<PasswordForgotPage />);

    const usernameInput = screen.getByLabelText('사용자명');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('이메일 발송 완료')).toBeInTheDocument();
      expect(screen.getByText('testuser님의 등록된 이메일로 비밀번호 재설정 링크를 발송했습니다')).toBeInTheDocument();
    });
  });

  it('disables submit button during submission', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PasswordForgotPage />);

    const usernameInput = screen.getByLabelText('사용자명');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('발송 중...')).toBeInTheDocument();
  });

  it('handles network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<PasswordForgotPage />);

    const usernameInput = screen.getByLabelText('사용자명');
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정 이메일 발송' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요')).toBeInTheDocument();
    });
  });
}); 