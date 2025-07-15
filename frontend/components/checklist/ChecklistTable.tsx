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
    <div className="rounded-lg shadow bg-white max-h-[calc(100vh-400px)] overflow-auto">
      {/* 모바일에서는 카드 형태로 표시 */}
      <div className="block md:hidden">
        {items.map(item => (
          <div
            key={item.id}
            className="border-b p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onItemClick(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onItemClick(item);
              }
            }}
            aria-label={`${item.text || item.description} 항목 클릭`}
          >
            <div className="font-medium mb-2">{item.text || item.description}</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">담당자:</span> {item.author || '-'}
              </div>
              <div>
                <span className="font-medium">등록일자:</span> {item.dueDate ? item.dueDate.slice(0, 10) : '-'}
              </div>
              <div>
                <span className="font-medium">분류:</span> {(item as any).category || '-'}
              </div>
              <div>
                <span className="font-medium">중요도:</span> {(item as any).priority || '-'}
              </div>
            </div>
            {item.attachments && item.attachments.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                📎 첨부파일 {item.attachments.length}개
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className='text-center text-gray-400 py-8'>No items found.</div>
        )}
      </div>

      {/* 데스크톱에서는 테이블 형태로 표시 */}
      <div className="hidden md:block">
        <table className='w-full text-sm border-collapse' role="table" aria-label={`${sectionTitle} 체크리스트`}>
          <thead className="sticky top-0 bg-blue-100 z-10">
            <tr className='bg-blue-100'>
              <th className='border px-2 py-1 min-w-[60px] sm:min-w-[80px] md:min-w-[100px]'>
                작업 이름
              </th>
              <th
                className='border px-2 py-1 whitespace-nowrap min-w-[100px] w-[100px] max-w-[120px] text-center cursor-pointer select-none'
                onClick={() => handleSort('author')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('author');
                  }
                }}
                aria-label="담당자로 정렬"
              >
                담당자
                {sortState?.column === 'author' &&
                  (sortState.order === 'asc' ? ' ▲' : ' ▼')}
              </th>
              <th
                className='border px-2 py-1 whitespace-nowrap min-w-[120px] w-[120px] max-w-[140px] text-center cursor-pointer select-none'
                onClick={() => handleSort('dueDate')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('dueDate');
                  }
                }}
                aria-label="등록일자로 정렬"
              >
                등록일자
                {sortState?.column === 'dueDate' &&
                  (sortState.order === 'asc' ? ' ▲' : ' ▼')}
              </th>
              <th
                className='border px-2 py-1 whitespace-nowrap min-w-[80px] w-[80px] max-w-[100px] text-center cursor-pointer select-none'
                onClick={() => handleSort('category')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('category');
                  }
                }}
                aria-label="분류로 정렬"
              >
                분류
                {sortState?.column === 'category' &&
                  (sortState.order === 'asc' ? ' ▲' : ' ▼')}
              </th>
              <th
                className='border px-2 py-1 whitespace-nowrap min-w-[80px] w-[80px] max-w-[100px] text-center cursor-pointer select-none'
                onClick={() => handleSort('priority')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('priority');
                  }
                }}
                aria-label="중요도로 정렬"
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
        {items.length === 0 && (
          <div className='text-center text-gray-400 py-8'>No items found.</div>
        )}
      </div>
    </div>
  );
};

export default ChecklistTable;
