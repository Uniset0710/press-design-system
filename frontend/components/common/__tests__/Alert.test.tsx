import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '../Alert';

describe('Alert Component', () => {
  it('renders success alert', () => {
    render(<Alert type="success" message="작업이 성공적으로 완료되었습니다" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('작업이 성공적으로 완료되었습니다')).toBeInTheDocument();
    expect(screen.getByLabelText('success 알림')).toBeInTheDocument();
  });

  it('renders error alert', () => {
    render(<Alert type="error" message="오류가 발생했습니다" />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByLabelText('error 알림')).toBeInTheDocument();
  });

  it('renders warning alert', () => {
    render(<Alert type="warning" message="주의가 필요합니다" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('주의가 필요합니다')).toBeInTheDocument();
  });

  it('renders info alert', () => {
    render(<Alert type="info" message="정보를 확인하세요" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('정보를 확인하세요')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <Alert 
        type="success" 
        title="성공" 
        message="작업이 완료되었습니다" 
      />
    );
    
    expect(screen.getByText('성공')).toBeInTheDocument();
    expect(screen.getByText('작업이 완료되었습니다')).toBeInTheDocument();
  });

  it('renders with close button when onClose is provided', () => {
    const onClose = jest.fn();
    render(
      <Alert 
        type="info" 
        message="닫을 수 있는 알림" 
        onClose={onClose}
      />
    );
    
    const closeButton = screen.getByLabelText('알림 닫기');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose is not provided', () => {
    render(<Alert type="info" message="닫을 수 없는 알림" />);
    
    expect(screen.queryByLabelText('알림 닫기')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Alert 
        type="success" 
        message="테스트 메시지" 
        className="custom-class"
      />
    );
    
    const alertElement = screen.getByRole('status');
    expect(alertElement).toHaveClass('custom-class');
  });

  it('renders with custom aria-label', () => {
    render(
      <Alert 
        type="error" 
        message="오류 메시지" 
        aria-label="사용자 정의 라벨"
      />
    );
    
    expect(screen.getByLabelText('사용자 정의 라벨')).toBeInTheDocument();
  });

  it('has correct aria-live attributes', () => {
    const { rerender } = render(<Alert type="error" message="오류" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    
    rerender(<Alert type="success" message="성공" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
}); 