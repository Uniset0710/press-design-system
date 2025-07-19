import React from 'react';
import { ChecklistItem } from '@/app/types/checklist';
import ChecklistTable from './ChecklistTable';

interface ChecklistTableContainerProps {
  items: ChecklistItem[];
  sectionTitle: string;
  selectedOptions: string[];
  sectionFilters: Record<string, string>;
  sectionAdvancedFilters?: Record<string, {
    author: string;
    startDate: string;
    endDate: string;
    category: string;
    priority: string;
  }>;
  sectionSort: Record<string, { column: 'author' | 'dueDate' | 'category' | 'priority' | null; order: 'asc' | 'desc'; }>;
  onSort: (sectionTitle: string, column: 'author' | 'dueDate' | 'category' | 'priority') => void;
  onItemClick: (item: ChecklistItem) => void;
  selectedPart: any;
  onExportXLSX?: (sectionTitle: string, items: ChecklistItem[]) => void;
}

const ChecklistTableContainer: React.FC<ChecklistTableContainerProps> = ({
  items,
  sectionTitle,
  selectedOptions,
  sectionFilters,
  sectionAdvancedFilters,
  sectionSort,
  onSort,
  onItemClick,
  selectedPart,
  onExportXLSX,
}) => {
  // selectedOptions에 따라 items 필터링
  const filteredItems = items.filter(item => {
    // 다중 옵션 처리: 쉼표로 구분된 옵션들을 분리
    const itemOptions = item.optionType ? item.optionType.split(',').map(opt => opt.trim()) : [];
    
    // selectedOptions 중 하나라도 itemOptions에 포함되어 있으면 표시
    return selectedOptions.some(selectedOption => 
      itemOptions.includes(selectedOption)
    );
  });

  // 고급 필터링 로직 추가
  const advancedFilteredItems = React.useMemo(() => {
    let filtered = filteredItems;

    // 텍스트 검색 필터
    const searchFilter = sectionFilters[sectionTitle];
    if (searchFilter) {
      const searchTerm = searchFilter.toLowerCase();
      filtered = filtered.filter(item => {
        const text = (item.text || item.description || '').toLowerCase();
        const author = (item.author || '').toLowerCase();
        const category = ((item as any).category || '').toLowerCase();
        const priority = ((item as any).priority || '').toLowerCase();
        
        return text.includes(searchTerm) || 
               author.includes(searchTerm) || 
               category.includes(searchTerm) || 
               priority.includes(searchTerm);
      });
    }

    if (!sectionAdvancedFilters || !sectionAdvancedFilters[sectionTitle]) {
      return filtered;
    }

    const filters = sectionAdvancedFilters[sectionTitle];
    return filtered.filter(item => {
      // 담당자 필터
      if (filters.author && item.author !== filters.author) {
        return false;
      }
      
      // 분류 필터
      if (filters.category && (item as any).category !== filters.category) {
        return false;
      }
      
      // 중요도 필터
      if (filters.priority && (item as any).priority !== filters.priority) {
        return false;
      }
      
      // 날짜 범위 필터
      if (filters.startDate || filters.endDate) {
        const itemDate = item.dueDate ? new Date(item.dueDate) : null;
        if (itemDate) {
          if (filters.startDate && itemDate < new Date(filters.startDate)) {
            return false;
          }
          if (filters.endDate && itemDate > new Date(filters.endDate)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [filteredItems, sectionFilters, sectionAdvancedFilters, sectionTitle]);

  // 정렬 로직 추가
  const sortedItems = React.useMemo(() => {
    const currentSort = sectionSort[sectionTitle];
    if (!currentSort || !currentSort.column) {
      return advancedFilteredItems;
    }

    const column = currentSort.column;
    return [...advancedFilteredItems].sort((a, b) => {
      const aValue = (a as any)[column] || '';
      const bValue = (b as any)[column] || '';
      
      // 중요도 특별 정렬 로직
      if (column === 'priority') {
        const priorityOrder = { '최상': 5, '상': 4, '중': 3, '하': 2, '최하': 1 };
        const aPriority = priorityOrder[aValue as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[bValue as keyof typeof priorityOrder] || 0;
        
        if (currentSort.order === 'asc') {
          return aPriority - bPriority; // 최하 -> 최상 순
        } else {
          return bPriority - aPriority; // 최상 -> 최하 순
        }
      }
      
      // 일반 문자열 정렬
      if (currentSort.order === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [advancedFilteredItems, sectionSort, sectionTitle]);

  // 필터/정렬 등은 필터링된 items 사용
  return (
    <div className="w-full">
      {/* 엑셀 내보내기 버튼 */}
      {onExportXLSX && sortedItems.length > 0 && (
        <div className="flex justify-end mb-4 px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8">
          <button
            onClick={() => onExportXLSX(sectionTitle, sortedItems)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            엑셀로 내보내기
          </button>
        </div>
      )}
      
      {sortedItems.length > 0 ? (
        <div className="px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8">
          <ChecklistTable
            items={sortedItems}
            sectionTitle={sectionTitle}
            sortState={sectionSort[sectionTitle]}
            onSort={onSort}
            onItemClick={onItemClick}
          />
        </div>
      ) : (
        <div className='ml-4 px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8'>No items found.</div>
      )}
    </div>
  );
};

export default ChecklistTableContainer;
