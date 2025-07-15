import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders with default props', () => {
    render(<Button onClick={mockOnClick}>Test Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-500', 'text-white', 'hover:bg-blue-600');
  });

  it('handles click events', () => {
    render(<Button onClick={mockOnClick}>Click Me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');

    rerender(<Button variant="success">Success</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-green-600');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-2', 'py-1', 'text-xs');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-2', 'text-sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-base');
  });

  it('applies disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('does not call onClick when disabled', () => {
    render(<Button onClick={mockOnClick} disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with different button types', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');

    rerender(<Button type="button">Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('renders children correctly', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('has proper focus styles', () => {
    render(<Button>Focusable</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
  });
}); 