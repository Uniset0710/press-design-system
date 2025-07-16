import { render, screen } from '@testing-library/react';
import Loading from '../Loading';

describe('Loading Component', () => {
  it('renders spinner variant by default', () => {
    render(<Loading />);
    
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('aria-label', '로딩 중');
  });

  it('renders with custom aria-label', () => {
    render(<Loading aria-label="데이터 로딩 중" />);
    
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toHaveAttribute('aria-label', '데이터 로딩 중');
  });

  it('renders with text', () => {
    render(<Loading text="데이터를 불러오는 중입니다" />);
    
    expect(screen.getByText('데이터를 불러오는 중입니다')).toBeInTheDocument();
    expect(screen.getByText('데이터를 불러오는 중입니다')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders dots variant', () => {
    render(<Loading variant="dots" />);
    
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders pulse variant', () => {
    render(<Loading variant="pulse" />);
    
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Loading className="custom-class" />);
    
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Loading size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4');
    
    rerender(<Loading size="md" />);
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8');
    
    rerender(<Loading size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('w-12', 'h-12');
  });
}); 