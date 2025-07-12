import React from 'react';

interface ChecklistFilterBarProps {
  sectionTitle: string;
  filterValue: string;
  advFilter: {
    author: string;
    startDate: string;
    endDate: string;
    category: string;
    priority: string;
  };
  authors: string[];
  onFilterChange: (value: string) => void;
  onAdvancedFilterChange: (filter: {
    author: string;
    startDate: string;
    endDate: string;
    category: string;
    priority: string;
  }) => void;
}

const ChecklistFilterBar: React.FC<ChecklistFilterBarProps> = ({
  sectionTitle,
  filterValue,
  advFilter,
  authors,
  onFilterChange,
  onAdvancedFilterChange
}) => {
  return (
    <div className="relative mb-2 flex gap-2 items-center">
      {/* 검색창 */}
      <input
        type="text"
        className="p-1 border rounded w-full pr-8 h-8 min-w-[120px]"
        placeholder={`Search in ${sectionTitle}`}
        value={filterValue}
        onChange={e => onFilterChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Escape") {
            onFilterChange("");
          }
        }}
      />
      {filterValue && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg"
          onClick={() => onFilterChange("")}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
      
      {/* 담당자 드롭다운 */}
      <select
        className="p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
        value={advFilter.author}
        onChange={e => onAdvancedFilterChange({ ...advFilter, author: e.target.value })}
      >
        <option value="">담당자</option>
        {authors.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      
      {/* 등록일자 기간(시작~종료) */}
      <input
        type="date"
        className="p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
        value={advFilter.startDate || ''}
        onChange={e => onAdvancedFilterChange({ ...advFilter, startDate: e.target.value })}
        placeholder="시작일"
      />
      <span className="mx-1">~</span>
      <input
        type="date"
        className="p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
        value={advFilter.endDate || ''}
        onChange={e => onAdvancedFilterChange({ ...advFilter, endDate: e.target.value })}
        placeholder="종료일"
      />
      
      {/* 분류 필터 */}
      <select
        className="p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
        value={advFilter.category || ''}
        onChange={e => onAdvancedFilterChange({ ...advFilter, category: e.target.value })}
      >
        <option value="">분류</option>
        <option value="용접">용접</option>
        <option value="가공">가공</option>
        <option value="조립">조립</option>
      </select>
      
      {/* 중요도 필터 */}
      <select
        className="p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
        value={advFilter.priority || ''}
        onChange={e => onAdvancedFilterChange({ ...advFilter, priority: e.target.value })}
      >
        <option value="">중요도</option>
        <option value="최상">최상</option>
        <option value="상">상</option>
        <option value="중">중</option>
        <option value="하">하</option>
        <option value="최하">최하</option>
      </select>
    </div>
  );
};

export default ChecklistFilterBar; 