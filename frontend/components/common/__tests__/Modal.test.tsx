import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const closeButton = screen.getByLabelText('모달 닫기');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    // aria-hidden이 true이므로 querySelector로 직접 접근
    const overlay = document.querySelector('[aria-hidden="true"]');
    fireEvent.click(overlay!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    // aria-hidden이 true이므로 querySelector로 직접 접근
    const modalContent = document.querySelector('[role="dialog"]');
    fireEvent.click(modalContent!);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" showCloseButton={false}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByLabelText('모달 닫기')).not.toBeInTheDocument();
  });

  it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" closeOnOverlayClick={false}>
        <div>Modal content</div>
      </Modal>
    );

    const overlay = document.querySelector('[aria-hidden="true"]');
    fireEvent.click(overlay!);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when Escape is pressed and closeOnEscape is false', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" closeOnEscape={false}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('applies different size classes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="sm">
        <div>Modal content</div>
      </Modal>
    );

    let modal = document.querySelector('[role="dialog"]');
    expect(modal).toHaveClass('max-w-sm');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="lg">
        <div>Modal content</div>
      </Modal>
    );

    modal = document.querySelector('[role="dialog"]');
    expect(modal).toHaveClass('max-w-lg');
  });

  it('applies custom className', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" className="custom-class">
        <div>Modal content</div>
      </Modal>
    );

    const modal = document.querySelector('[role="dialog"]');
    expect(modal).toHaveClass('custom-class');
  });

  it('has proper ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    const modal = document.querySelector('[role="dialog"]');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
  });

  it('has proper focus management', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <button>Focus me</button>
      </Modal>
    );

    // 포커스가 첫 번째 포커스 가능한 요소(닫기 버튼)에 갈 것으로 예상
    await waitFor(() => {
      const closeButton = screen.getByLabelText('모달 닫기');
      expect(closeButton).toHaveFocus();
    });
  });

  it('prevents body scroll when open', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });
}); 