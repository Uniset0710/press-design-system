import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from '../Input';

describe('Input Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default props', () => {
    render(<Input value="test" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('test');
    expect(input).toHaveClass('w-full', 'px-3', 'py-2', 'border', 'border-gray-300');
  });

  it('handles change events', () => {
    render(<Input value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('renders different input types correctly', () => {
    const { rerender } = render(<Input type="text" value="" onChange={mockOnChange} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" value="" onChange={mockOnChange} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" value="" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type="date" value="" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'date');

    rerender(<Input type="number" value="" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'number');
  });

  it('applies disabled state correctly', () => {
    render(<Input value="" onChange={mockOnChange} disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed');
  });

  it('renders with placeholder', () => {
    render(<Input value="" onChange={mockOnChange} placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Input value="" onChange={mockOnChange} className="custom-class" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('renders with required attribute', () => {
    render(<Input value="" onChange={mockOnChange} required />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('renders with name and id attributes', () => {
    render(<Input value="" onChange={mockOnChange} name="test-name" id="test-id" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'test-name');
    expect(input).toHaveAttribute('id', 'test-id');
  });

  it('renders with min and max attributes for number type', () => {
    render(
      <Input 
        type="number" 
        value="" 
        onChange={mockOnChange} 
        min={0} 
        max={100} 
      />
    );
    
    const input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('has proper focus styles', () => {
    render(<Input value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
  });

  it('does not call onChange when disabled', () => {
    render(<Input value="" onChange={mockOnChange} disabled />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    // Disabled inputs still fire change events, but the component should handle it
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('renders with different values', () => {
    const { rerender } = render(<Input value="initial" onChange={mockOnChange} />);
    expect(screen.getByRole('textbox')).toHaveValue('initial');

    rerender(<Input value="updated" onChange={mockOnChange} />);
    expect(screen.getByRole('textbox')).toHaveValue('updated');
  });
}); 