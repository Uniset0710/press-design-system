import React from 'react';
import { ChecklistItem } from '@/app/types/checklist';
import ChecklistTable from './ChecklistTable';

interface ChecklistTableContainerProps {
  items: ChecklistItem[];
  sectionTitle: string;
  selectedOptions: string[];
  sectionFilters: Record<string, string>;
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
  sectionSort,
  onSort,
  onItemClick,
  selectedPart,
  onExportXLSX,
}) => {
  // selectedOptions에 따라 items 필터링
  const filteredItems = items.filter(item => {
    // item.optionType이 selectedOptions에 포함되어 있으면 표시
    return selectedOptions.includes(item.optionType);
  });

  // 필터/정렬 등은 필터링된 items 사용
  return (
    <div className="w-full px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8">
      {/* 엑셀 내보내기 버튼 */}
      {onExportXLSX && filteredItems.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => onExportXLSX(sectionTitle, filteredItems)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            엑셀로 내보내기
          </button>
        </div>
      )}
      
      {filteredItems.length > 0 ? (
        <ChecklistTable
          items={filteredItems}
          sectionTitle={sectionTitle}
          sortState={sectionSort[sectionTitle]}
          onSort={onSort}
          onItemClick={onItemClick}
        />
      ) : (
        <div className='ml-4'>No items found.</div>
      )}
    </div>
  );
};

export default ChecklistTableContainer;
