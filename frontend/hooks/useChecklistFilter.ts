import { ChecklistItem } from '@/app/types/checklist';

interface FilterOptions {
  text: string;
  author: string;
  startDate: string;
  endDate: string;
  category: string;
  priority: string;
}

interface SortOptions {
  column: 'author' | 'dueDate' | 'category' | 'priority' | null;
  order: 'asc' | 'desc';
}

export function filterChecklistItems(
  items: ChecklistItem[],
  filterOptions: FilterOptions,
  sortOptions: SortOptions
): ChecklistItem[] {
  let filteredItems = [...items];

  // 텍스트 필터링
  if (filterOptions.text) {
    filteredItems = filteredItems.filter(
      item =>
        item.text.toLowerCase().includes(filterOptions.text.toLowerCase()) ||
        (item.description &&
          item.description
            .toLowerCase()
            .includes(filterOptions.text.toLowerCase()))
    );
  }

  // 담당자 필터링
  if (filterOptions.author) {
    filteredItems = filteredItems.filter(
      item => (item.author || '') === filterOptions.author
    );
  }

  // 날짜 범위 필터링
  if (filterOptions.startDate) {
    filteredItems = filteredItems.filter(item =>
      item.dueDate
        ? item.dueDate.slice(0, 10) >= filterOptions.startDate
        : false
    );
  }

  if (filterOptions.endDate) {
    filteredItems = filteredItems.filter(item =>
      item.dueDate
        ? item.dueDate.slice(0, 10) <= filterOptions.endDate
        : false
    );
  }

  // 분류 필터링
  if (filterOptions.category) {
    filteredItems = filteredItems.filter(
      item => ((item as any).category || '') === filterOptions.category
    );
  }

  // 중요도 필터링
  if (filterOptions.priority) {
    filteredItems = filteredItems.filter(
      item => ((item as any).priority || '') === filterOptions.priority
    );
  }

  // 정렬
  if (sortOptions.column) {
    filteredItems.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortOptions.column) {
        case 'author':
          aVal = a.author || '';
          bVal = b.author || '';
          break;
        case 'dueDate':
          aVal = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bVal = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'category':
          aVal = (a as any).category || '';
          bVal = (b as any).category || '';
          break;
        case 'priority':
          aVal = (a as any).priority || '';
          bVal = (b as any).priority || '';
          break;
        default:
          return 0;
      }

      if (sortOptions.order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }

  return filteredItems;
}

// Hook 버전 (기존 코드와의 호환성을 위해 유지)
export function useChecklistFilter(
  items: ChecklistItem[],
  filterOptions: FilterOptions,
  sortOptions: SortOptions
) {
  return filterChecklistItems(items, filterOptions, sortOptions);
}
