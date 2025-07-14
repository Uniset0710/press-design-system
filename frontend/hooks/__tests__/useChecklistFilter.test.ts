import { filterChecklistItems } from '../useChecklistFilter';
import { ChecklistItem } from '@/app/types/checklist';

const mockItems: ChecklistItem[] = [
  {
    id: '1',
    text: 'Test Item 1',
    description: 'Description 1',
    section: 'section1',
    partId: 1,
    optionType: 'test',
    author: 'John Doe',
    dueDate: '2024-01-15',
  },
  {
    id: '2',
    text: 'Test Item 2',
    description: 'Description 2',
    section: 'section1',
    partId: 1,
    optionType: 'test',
    author: 'Jane Smith',
    dueDate: '2024-01-20',
  },
  {
    id: '3',
    text: 'Another Item',
    description: 'Another Description',
    section: 'section2',
    partId: 2,
    optionType: 'test',
    author: 'Bob Johnson',
    dueDate: '2024-01-10',
  },
];

describe('filterChecklistItems', () => {
  it('returns all items when no filters are applied', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: '',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('filters by text search', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: 'Test',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Test Item 1');
    expect(result[1].text).toBe('Test Item 2');
  });

  it('filters by text search in description', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: 'Description',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(3);
  });

  it('filters by author', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: '',
        author: 'John Doe',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('John Doe');
  });

  it('filters by start date', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: '',
        author: '',
        startDate: '2024-01-15',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(2);
    expect(result[0].dueDate).toBe('2024-01-15');
    expect(result[1].dueDate).toBe('2024-01-20');
  });

  it('filters by end date', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: '',
        author: '',
        startDate: '',
        endDate: '2024-01-15',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(2);
    expect(result[0].dueDate).toBe('2024-01-15');
    expect(result[1].dueDate).toBe('2024-01-10');
  });

  it('filters by date range', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: '',
        author: '',
        startDate: '2024-01-10',
        endDate: '2024-01-15',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(2);
    expect(result[0].dueDate).toBe('2024-01-15');
    expect(result[1].dueDate).toBe('2024-01-10');
  });

  it('sorts by author ascending', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: '',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: 'author', order: 'asc' }
    );

    expect(result).toHaveLength(3);
    expect(result[0].author).toBe('Bob Johnson');
    expect(result[1].author).toBe('Jane Smith');
    expect(result[2].author).toBe('John Doe');
  });

  it('sorts by author descending', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: '',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: 'author', order: 'desc' }
    );

    expect(result).toHaveLength(3);
    expect(result[0].author).toBe('John Doe');
    expect(result[1].author).toBe('Jane Smith');
    expect(result[2].author).toBe('Bob Johnson');
  });

  it('sorts by dueDate ascending', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: '',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: 'dueDate', order: 'asc' }
    );

    expect(result).toHaveLength(3);
    expect(result[0].dueDate).toBe('2024-01-10');
    expect(result[1].dueDate).toBe('2024-01-15');
    expect(result[2].dueDate).toBe('2024-01-20');
  });

  it('sorts by dueDate descending', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: '',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: 'dueDate', order: 'desc' }
    );

    expect(result).toHaveLength(3);
    expect(result[0].dueDate).toBe('2024-01-20');
    expect(result[1].dueDate).toBe('2024-01-15');
    expect(result[2].dueDate).toBe('2024-01-10');
  });

  it('handles items without dueDate in sorting', () => {
    const itemsWithNullDate = [
      ...mockItems,
      {
        id: '4',
        text: 'No Date Item',
        description: 'No date description',
        section: 'section1',
        partId: 1,
        optionType: 'test',
        author: 'Alice',
        dueDate: undefined,
      },
    ];

    const result = filterChecklistItems(
      itemsWithNullDate,
      {
        text: '',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: 'dueDate', order: 'asc' }
    );

    expect(result).toHaveLength(4);
    // undefined dates should be sorted first in ascending order
    expect(result[0].dueDate).toBeUndefined();
    expect(result[1].dueDate).toBe('2024-01-10');
  });

  it('combines text filter with author filter', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: 'Test',
        author: 'John Doe',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Test Item 1');
    expect(result[0].author).toBe('John Doe');
  });

  it('combines multiple filters', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: 'Test',
        author: 'John Doe',
        startDate: '2024-01-10',
        endDate: '2024-01-20',
        category: '',
        priority: '',
      },
      { column: 'author', order: 'asc' }
    );

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Test Item 1');
    expect(result[0].author).toBe('John Doe');
  });

  it('returns empty array when no items match filters', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: 'NonExistent',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(0);
  });

  it('handles case insensitive text search', () => {
    const result = filterChecklistItems(
      mockItems,
      {
        text: 'test',
        author: '',
        startDate: '',
        endDate: '',
        category: '',
        priority: '',
      },
      { column: null, order: 'asc' }
    );

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Test Item 1');
    expect(result[1].text).toBe('Test Item 2');
  });
}); 