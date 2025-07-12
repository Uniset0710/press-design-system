import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChecklistTable from '../ChecklistTable';
import { ChecklistItem } from '@/app/types/checklist';

// Mock data
const mockItems: ChecklistItem[] = [
  {
    id: '1',
    text: 'Test Item 1',
    description: 'Test Description 1',
    section: 'Test Section',
    partId: 1,
    optionType: 'test',
    author: 'John Doe',
    dueDate: '2024-01-15',
    attachments: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    text: 'Test Item 2',
    description: 'Test Description 2',
    section: 'Test Section',
    partId: 1,
    optionType: 'test',
    author: 'Jane Smith',
    dueDate: '2024-01-20',
    attachments: [{ id: '1', filename: 'test.pdf', url: 'test.pdf', checklistItemId: '2', mimeType: 'application/pdf' }],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

const mockOnSort = jest.fn();
const mockOnItemClick = jest.fn();

describe('ChecklistTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table with correct headers', () => {
    render(
      <ChecklistTable
        items={mockItems}
        sectionTitle="Test Section"
        onSort={mockOnSort}
        onItemClick={mockOnItemClick}
      />
    );

    expect(screen.getByText('작업 이름')).toBeInTheDocument();
    expect(screen.getByText('담당자')).toBeInTheDocument();
    expect(screen.getByText('등록일자')).toBeInTheDocument();
    expect(screen.getByText('분류')).toBeInTheDocument();
    expect(screen.getByText('중요도')).toBeInTheDocument();
    expect(screen.getByText('첨부')).toBeInTheDocument();
  });

  it('renders all items in table', () => {
    render(
      <ChecklistTable
        items={mockItems}
        sectionTitle="Test Section"
        onSort={mockOnSort}
        onItemClick={mockOnItemClick}
      />
    );

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('calls onSort when header is clicked', () => {
    render(
      <ChecklistTable
        items={mockItems}
        sectionTitle="Test Section"
        onSort={mockOnSort}
        onItemClick={mockOnItemClick}
      />
    );

    fireEvent.click(screen.getByText('담당자'));
    expect(mockOnSort).toHaveBeenCalledWith('Test Section', 'author');

    fireEvent.click(screen.getByText('등록일자'));
    expect(mockOnSort).toHaveBeenCalledWith('Test Section', 'dueDate');
  });

  it('shows sort indicators when sortState is provided', () => {
    const sortState = { column: 'author' as const, order: 'asc' as const };
    
    render(
      <ChecklistTable
        items={mockItems}
        sectionTitle="Test Section"
        sortState={sortState}
        onSort={mockOnSort}
        onItemClick={mockOnItemClick}
      />
    );

    expect(screen.getByText('담당자 ▲')).toBeInTheDocument();
  });

  it('calls onItemClick when row is clicked', () => {
    render(
      <ChecklistTable
        items={mockItems}
        sectionTitle="Test Section"
        onSort={mockOnSort}
        onItemClick={mockOnItemClick}
      />
    );

    fireEvent.click(screen.getByText('Test Item 1'));
    expect(mockOnItemClick).toHaveBeenCalledWith(mockItems[0]);
  });

  it('displays attachment count correctly', () => {
    render(
      <ChecklistTable
        items={mockItems}
        sectionTitle="Test Section"
        onSort={mockOnSort}
        onItemClick={mockOnItemClick}
      />
    );

    // Item with attachment (second item)
    expect(screen.getByText('📎 1')).toBeInTheDocument();
    
    // Item without attachment (first item) - check specifically in attachment column
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // First row is header, second is first data row
    const attachmentCell = firstDataRow.querySelector('td:last-child');
    expect(attachmentCell).toHaveTextContent('-');
  });

  it('displays due date in correct format', () => {
    render(
      <ChecklistTable
        items={mockItems}
        sectionTitle="Test Section"
        onSort={mockOnSort}
        onItemClick={mockOnItemClick}
      />
    );

    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('2024-01-20')).toBeInTheDocument();
  });

  it('handles empty items array', () => {
    render(
      <ChecklistTable
        items={[]}
        sectionTitle="Test Section"
        onSort={mockOnSort}
        onItemClick={mockOnItemClick}
      />
    );

    expect(screen.getByText('작업 이름')).toBeInTheDocument();
    // Should not crash with empty items
  });
}); 