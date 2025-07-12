import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChecklistFilterBar from '../ChecklistFilterBar';

const mockAdvFilter = {
  author: '',
  startDate: '',
  endDate: '',
  category: '',
  priority: ''
};

const mockAuthors = ['John Doe', 'Jane Smith', 'Bob Johnson'];

const mockOnFilterChange = jest.fn();
const mockOnAdvancedFilterChange = jest.fn();

describe('ChecklistFilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with correct placeholder', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    expect(screen.getByPlaceholderText('Search in Test Section')).toBeInTheDocument();
  });

  it('calls onFilterChange when search input changes', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search in Test Section');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('test search');
  });

  it('shows clear button when filter has value', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue="test value"
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('calls onFilterChange with empty string when clear button is clicked', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue="test value"
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Clear search'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('');
  });

  it('renders author dropdown with all authors', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    expect(screen.getByText('담당자')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('calls onAdvancedFilterChange when author is selected', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    const authorSelect = screen.getByDisplayValue('담당자');
    fireEvent.change(authorSelect, { target: { value: 'John Doe' } });
    
    expect(mockOnAdvancedFilterChange).toHaveBeenCalledWith({
      ...mockAdvFilter,
      author: 'John Doe'
    });
  });

  it('renders date inputs', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    const dateInputs = screen.getAllByDisplayValue('');
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  it('calls onAdvancedFilterChange when start date changes', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    // Find date inputs by their type attribute
    const dateInputs = screen.getAllByDisplayValue('').filter(input => 
      input.getAttribute('type') === 'date'
    );
    const startDateInput = dateInputs[0]; // First date input is start date
    
    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
    
    expect(mockOnAdvancedFilterChange).toHaveBeenCalledWith({
      ...mockAdvFilter,
      startDate: '2024-01-15'
    });
  });

  it('renders category dropdown with options', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    expect(screen.getByText('분류')).toBeInTheDocument();
    expect(screen.getByText('용접')).toBeInTheDocument();
    expect(screen.getByText('가공')).toBeInTheDocument();
    expect(screen.getByText('조립')).toBeInTheDocument();
  });

  it('renders priority dropdown with options', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    expect(screen.getByText('중요도')).toBeInTheDocument();
    expect(screen.getByText('최상')).toBeInTheDocument();
    expect(screen.getByText('상')).toBeInTheDocument();
    expect(screen.getByText('중')).toBeInTheDocument();
    expect(screen.getByText('하')).toBeInTheDocument();
    expect(screen.getByText('최하')).toBeInTheDocument();
  });

  it('calls onAdvancedFilterChange when category is selected', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    const categorySelect = screen.getByDisplayValue('분류');
    fireEvent.change(categorySelect, { target: { value: '용접' } });
    
    expect(mockOnAdvancedFilterChange).toHaveBeenCalledWith({
      ...mockAdvFilter,
      category: '용접'
    });
  });

  it('calls onAdvancedFilterChange when priority is selected', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue=""
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    const prioritySelect = screen.getByDisplayValue('중요도');
    fireEvent.change(prioritySelect, { target: { value: '상' } });
    
    expect(mockOnAdvancedFilterChange).toHaveBeenCalledWith({
      ...mockAdvFilter,
      priority: '상'
    });
  });

  it('clears filter when Escape key is pressed', () => {
    render(
      <ChecklistFilterBar
        sectionTitle="Test Section"
        filterValue="test value"
        advFilter={mockAdvFilter}
        authors={mockAuthors}
        onFilterChange={mockOnFilterChange}
        onAdvancedFilterChange={mockOnAdvancedFilterChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search in Test Section');
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('');
  });
}); 