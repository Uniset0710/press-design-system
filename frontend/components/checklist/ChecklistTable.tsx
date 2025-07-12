import React from 'react';
import { ChecklistItem } from '@/app/types/checklist';
import ChecklistRow from './ChecklistRow';

/**
 * 체크리스트 아이템들을 테이블 형태로 표시하는 컴포넌트
 *
 * @description
 * - 체크리스트 아이템들을 테이블 형태로 렌더링합니다
 * - 헤더 클릭으로 정렬 기능을 제공합니다
 * - 각 행 클릭 시 상세 정보를 볼 수 있습니다
 * - 반응형 디자인으로 모바일에서도 사용 가능합니다
 *
 * @example
 * ```tsx
 * <ChecklistTable
 *   items={checklistItems}
 *   sectionTitle="My Section"
 *   onSort={handleSort}
 *   onItemClick={handleItemClick}
 * />
 * ```
 */
interface ChecklistTableProps {
  /** 표시할 체크리스트 아이템 배열 */
  items: ChecklistItem[];
  /** 섹션 제목 (정렬 시 식별자로 사용) */
  sectionTitle: string;
  /** 현재 정렬 상태 (선택사항) */
  sortState?: {
    column: 'author' | 'dueDate' | 'category' | 'priority' | null;
    order: 'asc' | 'desc';
  };
  /** 정렬 이벤트 핸들러 */
  onSort: (
    sectionTitle: string,
    column: 'author' | 'dueDate' | 'category' | 'priority'
  ) => void;
  /** 아이템 클릭 이벤트 핸들러 */
  onItemClick: (item: ChecklistItem) => void;
}

const ChecklistTable: React.FC<ChecklistTableProps> = ({
  items,
  sectionTitle,
  sortState,
  onSort,
  onItemClick,
}) => {
  const handleSort = (
    column: 'author' | 'dueDate' | 'category' | 'priority'
  ) => {
    onSort(sectionTitle, column);
  };

  return (
    <table className='w-full text-sm border-collapse'>
      <thead>
        <tr className='bg-blue-100'>
          <th className='border px-2 py-1 min-w-[60px] sm:min-w-[80px] md:min-w-[100px]'>
            작업 이름
          </th>
          <th
            className='border px-2 py-1 whitespace-nowrap min-w-[100px] w-[100px] max-w-[120px] text-center cursor-pointer select-none'
            onClick={() => handleSort('author')}
          >
            담당자
            {sortState?.column === 'author' &&
              (sortState.order === 'asc' ? ' ▲' : ' ▼')}
          </th>
          <th
            className='border px-2 py-1 whitespace-nowrap min-w-[120px] w-[120px] max-w-[140px] text-center cursor-pointer select-none'
            onClick={() => handleSort('dueDate')}
          >
            등록일자
            {sortState?.column === 'dueDate' &&
              (sortState.order === 'asc' ? ' ▲' : ' ▼')}
          </th>
          <th
            className='border px-2 py-1 whitespace-nowrap min-w-[80px] w-[80px] max-w-[100px] text-center cursor-pointer select-none'
            onClick={() => handleSort('category')}
          >
            분류
            {sortState?.column === 'category' &&
              (sortState.order === 'asc' ? ' ▲' : ' ▼')}
          </th>
          <th
            className='border px-2 py-1 whitespace-nowrap min-w-[80px] w-[80px] max-w-[100px] text-center cursor-pointer select-none'
            onClick={() => handleSort('priority')}
          >
            중요도
            {sortState?.column === 'priority' &&
              (sortState.order === 'asc' ? ' ▲' : ' ▼')}
          </th>
          <th className='border px-2 py-1 whitespace-nowrap min-w-[60px] w-[60px] max-w-[80px] text-center'>
            첨부
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <ChecklistRow
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ChecklistTable;
