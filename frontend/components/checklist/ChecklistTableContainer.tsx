import React from 'react';
import { ChecklistItem } from '@/app/types/checklist';
import ChecklistTable from './ChecklistTable';

interface ChecklistTableContainerProps {
  // 섹션 정보
  sections: Array<{ title: string; options: string[] }>;
  currentSectionIndex: number;

  // 데이터
  checklistData: Record<string, ChecklistItem[]>;
  selectedOptions: string[];

  // 필터/정렬 상태
  sectionFilters: Record<string, string>;
  sectionSort: Record<
    string,
    {
      column: 'author' | 'dueDate' | 'category' | 'priority' | null;
      order: 'asc' | 'desc';
    }
  >;

  // 핸들러
  onSort: (
    sectionTitle: string,
    column: 'author' | 'dueDate' | 'category' | 'priority'
  ) => void;
  onItemClick: (item: ChecklistItem) => void;

  // 선택된 파트
  selectedPart: any;
}

const ChecklistTableContainer: React.FC<ChecklistTableContainerProps> = ({
  sections,
  currentSectionIndex,
  checklistData,
  selectedOptions,
  sectionFilters,
  sectionSort,
  onSort,
  onItemClick,
  selectedPart,
}) => {
  // 현재 섹션 정보
  const currentSection = sections[currentSectionIndex];

  // 현재 섹션의 아이템들 계산
  const getCurrentSectionItems = (): ChecklistItem[] => {
    if (!currentSection || !selectedPart) return [];

    // 현재 섹션에 속하는 옵션들만 필터링
    const sectionOpts = currentSection.options.filter(opt =>
      selectedOptions.includes(opt)
    );

    // 모든 아이템 수집
    const allItems = sectionOpts
      .flatMap(opt => checklistData[opt] || [])
      .filter(item => item.section === currentSection.title);

    // 중복 제거 (text 기준, 마지막 발생 보존)
    let uniqueItems = [
      ...new Map(
        allItems
          .filter(item => item.section === currentSection.title)
          .map(item => [item.text, item])
      ).values(),
    ];

    // 섹션별 필터 적용
    const filterValue = sectionFilters[currentSection.title] || '';
    if (filterValue) {
      uniqueItems = uniqueItems.filter(
        item =>
          item.text.toLowerCase().includes(filterValue.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(filterValue.toLowerCase()))
      );
    }

    // 섹션별 정렬 적용
    const sortState = sectionSort[currentSection.title];
    let sortedItems = [...uniqueItems];

    if (sortState?.column) {
      sortedItems.sort((a, b) => {
        let aVal: any, bVal: any;

        switch (sortState.column) {
          case 'author':
            aVal = a.author || '';
            bVal = b.author || '';
            break;
          case 'dueDate':
            aVal = a.dueDate || '';
            bVal = b.dueDate || '';
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

        if (sortState.order === 'asc') {
          return aVal.localeCompare(bVal);
        } else {
          return bVal.localeCompare(aVal);
        }
      });
    }

    return sortedItems;
  };

  const currentItems = getCurrentSectionItems();

  return (
    <div>
      {currentItems.length > 0 ? (
        <ChecklistTable
          items={currentItems}
          sectionTitle={currentSection.title}
          sortState={sectionSort[currentSection.title]}
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
