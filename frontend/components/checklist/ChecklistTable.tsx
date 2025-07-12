import React from 'react';
import { ChecklistItem } from '@/app/types/checklist';
import ChecklistRow from './ChecklistRow';

interface ChecklistTableProps {
  items: ChecklistItem[];
  sectionTitle: string;
  sortState?: { column: 'author' | 'dueDate' | 'category' | 'priority' | null, order: 'asc' | 'desc' };
  onSort: (sectionTitle: string, column: 'author' | 'dueDate' | 'category' | 'priority') => void;
  onItemClick: (item: ChecklistItem) => void;
}

const ChecklistTable: React.FC<ChecklistTableProps> = ({
  items,
  sectionTitle,
  sortState,
  onSort,
  onItemClick
}) => {
  const handleSort = (column: 'author' | 'dueDate' | 'category' | 'priority') => {
    onSort(sectionTitle, column);
  };

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-blue-100">
          <th className="border px-2 py-1 min-w-[60px] sm:min-w-[80px] md:min-w-[100px]">작업 이름</th>
          <th
            className="border px-2 py-1 whitespace-nowrap min-w-[100px] w-[100px] max-w-[120px] text-center cursor-pointer select-none"
            onClick={() => handleSort('author')}
          >
            담당자
            {sortState?.column === 'author' && (sortState.order === 'asc' ? ' ▲' : ' ▼')}
          </th>
          <th
            className="border px-2 py-1 whitespace-nowrap min-w-[120px] w-[120px] max-w-[140px] text-center cursor-pointer select-none"
            onClick={() => handleSort('dueDate')}
          >
            등록일자
            {sortState?.column === 'dueDate' && (sortState.order === 'asc' ? ' ▲' : ' ▼')}
          </th>
          <th
            className="border px-2 py-1 whitespace-nowrap min-w-[80px] w-[80px] max-w-[100px] text-center cursor-pointer select-none"
            onClick={() => handleSort('category')}
          >
            분류
            {sortState?.column === 'category' && (sortState.order === 'asc' ? ' ▲' : ' ▼')}
          </th>
          <th
            className="border px-2 py-1 whitespace-nowrap min-w-[80px] w-[80px] max-w-[100px] text-center cursor-pointer select-none"
            onClick={() => handleSort('priority')}
          >
            중요도
            {sortState?.column === 'priority' && (sortState.order === 'asc' ? ' ▲' : ' ▼')}
          </th>
          <th className="border px-2 py-1 whitespace-nowrap min-w-[60px] w-[60px] max-w-[80px] text-center">첨부</th>
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