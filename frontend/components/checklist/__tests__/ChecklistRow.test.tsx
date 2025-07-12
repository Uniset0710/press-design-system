import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChecklistRow from '../ChecklistRow';
import { ChecklistItem } from '@/app/types/checklist';

const mockItem: ChecklistItem = {
  id: '1',
  text: 'Test Item',
  description: 'Test Description',
  section: 'Test Section',
  partId: 1,
  optionType: 'test',
  author: 'John Doe',
  dueDate: '2024-01-15',
  attachments: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockOnClick = jest.fn();

describe('ChecklistRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders item data correctly', () => {
    render(
      <table>
        <tbody>
          <ChecklistRow item={mockItem} onClick={mockOnClick} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('calls onClick when row is clicked', () => {
    render(
      <table>
        <tbody>
          <ChecklistRow item={mockItem} onClick={mockOnClick} />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByText('Test Item'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('displays text or description', () => {
    const itemWithDescription = {
      ...mockItem,
      text: '',
      description: 'Test Description'
    };

    render(
      <table>
        <tbody>
          <ChecklistRow item={itemWithDescription} onClick={mockOnClick} />
        </tbody>
      </table>
    );
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays attachment count when attachments exist', () => {
    const itemWithAttachments = {
      ...mockItem,
      attachments: [
        { id: '1', filename: 'test.pdf', url: 'test.pdf', checklistItemId: '1', mimeType: 'application/pdf' },
        { id: '2', filename: 'test2.pdf', url: 'test2.pdf', checklistItemId: '1', mimeType: 'application/pdf' }
      ]
    };

    render(
      <table>
        <tbody>
          <ChecklistRow item={itemWithAttachments} onClick={mockOnClick} />
        </tbody>
      </table>
    );
    expect(screen.getByText('📎 2')).toBeInTheDocument();
  });

  it('displays dash when no attachments', () => {
    render(
      <table>
        <tbody>
          <ChecklistRow item={mockItem} onClick={mockOnClick} />
        </tbody>
      </table>
    );
    // Check for attachment column dash specifically
    const attachmentCell = screen.getByText('Test Item').closest('tr')?.querySelector('td:last-child');
    expect(attachmentCell).toHaveTextContent('-');
  });

  it('displays dash when author is missing', () => {
    const itemWithoutAuthor = { ...mockItem, author: undefined };
    render(
      <table>
        <tbody>
          <ChecklistRow item={itemWithoutAuthor} onClick={mockOnClick} />
        </tbody>
      </table>
    );
    // Check for author column dash specifically
    const authorCell = screen.getByText('Test Item').closest('tr')?.querySelector('td:nth-child(2)');
    expect(authorCell).toHaveTextContent('-');
  });

  it('displays dash when dueDate is missing', () => {
    const itemWithoutDueDate = { ...mockItem, dueDate: undefined };
    render(
      <table>
        <tbody>
          <ChecklistRow item={itemWithoutDueDate} onClick={mockOnClick} />
        </tbody>
      </table>
    );
    // Check for dueDate column dash specifically
    const dueDateCell = screen.getByText('Test Item').closest('tr')?.querySelector('td:nth-child(3)');
    expect(dueDateCell).toHaveTextContent('-');
  });

  it('formats due date correctly', () => {
    const itemWithLongDate = { ...mockItem, dueDate: '2024-01-15T10:30:00Z' };
    render(
      <table>
        <tbody>
          <ChecklistRow item={itemWithLongDate} onClick={mockOnClick} />
        </tbody>
      </table>
    );
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('has correct CSS classes for styling', () => {
    render(
      <table>
        <tbody>
          <ChecklistRow item={mockItem} onClick={mockOnClick} />
        </tbody>
      </table>
    );
    
    const row = screen.getByText('Test Item').closest('tr');
    expect(row).toHaveClass('bg-white', 'cursor-pointer', 'hover:bg-blue-50');
  });
}); 