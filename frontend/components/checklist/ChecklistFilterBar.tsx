import React, { useEffect, useState } from 'react';

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
  onAdvancedFilterChange: (filter: any) => void;
}

const MOBILE_BREAKPOINT = 768;

const ChecklistFilterBar: React.FC<ChecklistFilterBarProps> = ({
  sectionTitle,
  filterValue,
  advFilter,
  authors,
  onFilterChange,
  onAdvancedFilterChange,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    // 모바일 UI만 렌더링
    return (
      <div className='relative mb-2'>
        <div className='space-y-2'>
          {/* 검색창 */}
          <div className='relative'>
            <input
              type='text'
              className='p-2 border rounded w-full pr-8'
              placeholder={`Search in ${sectionTitle}`}
              value={filterValue}
              onChange={e => onFilterChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  onFilterChange('');
                }
              }}
              aria-label={`${sectionTitle}에서 검색`}
            />
            {filterValue && (
              <button
                type='button'
                className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg'
                onClick={() => onFilterChange('')}
                aria-label='검색어 지우기'
              >
                ×
              </button>
            )}
          </div>

          {/* 필터 옵션들 */}
          <div className='grid grid-cols-2 gap-2'>
            <select
              className='p-2 border rounded'
              value={advFilter.author}
              onChange={e =>
                onAdvancedFilterChange({ ...advFilter, author: e.target.value })
              }
              aria-label="담당자 필터"
            >
              <option value=''>담당자</option>
              {authors.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              className='p-2 border rounded'
              value={advFilter.category || ''}
              onChange={e =>
                onAdvancedFilterChange({ ...advFilter, category: e.target.value })
              }
              aria-label="분류 필터"
            >
              <option value=''>분류</option>
              <option value='용접'>용접</option>
              <option value='가공'>가공</option>
              <option value='조립'>조립</option>
            </select>

            <select
              className='p-2 border rounded'
              value={advFilter.priority || ''}
              onChange={e =>
                onAdvancedFilterChange({ ...advFilter, priority: e.target.value })
              }
              aria-label="중요도 필터"
            >
              <option value=''>중요도</option>
              <option value='최상'>최상</option>
              <option value='상'>상</option>
              <option value='중'>중</option>
              <option value='하'>하</option>
              <option value='최하'>최하</option>
            </select>

            <div className='col-span-2'>
              <div className='flex gap-2'>
                <input
                  type='date'
                  className='p-2 border rounded flex-1'
                  value={advFilter.startDate || ''}
                  onChange={e =>
                    onAdvancedFilterChange({ ...advFilter, startDate: e.target.value })
                  }
                  placeholder='시작일'
                  aria-label="시작일"
                />
                <span className='flex items-center'>~</span>
                <input
                  type='date'
                  className='p-2 border rounded flex-1'
                  value={advFilter.endDate || ''}
                  onChange={e =>
                    onAdvancedFilterChange({ ...advFilter, endDate: e.target.value })
                  }
                  placeholder='종료일'
                  aria-label="종료일"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 데스크탑 UI만 렌더링
  return (
    <div className='relative mb-2 flex gap-2 items-center'>
      {/* 검색창 */}
      <div className='relative flex-1'>
        <input
          type='text'
          className='p-1 border rounded w-full pr-8 h-8 min-w-[120px]'
          placeholder={`Search in ${sectionTitle}`}
          value={filterValue}
          onChange={e => onFilterChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              onFilterChange('');
            }
          }}
          aria-label={`${sectionTitle}에서 검색`}
        />
        {filterValue && (
          <button
            type='button'
            className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg'
            onClick={() => onFilterChange('')}
            aria-label='검색어 지우기'
          >
            ×
          </button>
        )}
      </div>

      {/* 담당자 드롭다운 */}
      <select
        className='p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]'
        value={advFilter.author}
        onChange={e =>
          onAdvancedFilterChange({ ...advFilter, author: e.target.value })
        }
        aria-label="담당자 필터"
      >
        <option value=''>담당자</option>
        {authors.map(a => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      {/* 등록일자 기간(시작~종료) */}
      <input
        type='date'
        className='p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]'
        value={advFilter.startDate || ''}
        onChange={e =>
          onAdvancedFilterChange({ ...advFilter, startDate: e.target.value })
        }
        placeholder='시작일'
        aria-label="시작일"
      />
      <span className='mx-1'>~</span>
      <input
        type='date'
        className='p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]'
        value={advFilter.endDate || ''}
        onChange={e =>
          onAdvancedFilterChange({ ...advFilter, endDate: e.target.value })
        }
        placeholder='종료일'
        aria-label="종료일"
      />

      {/* 분류 필터 */}
      <select
        className='p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]'
        value={advFilter.category || ''}
        onChange={e =>
          onAdvancedFilterChange({ ...advFilter, category: e.target.value })
        }
        aria-label="분류 필터"
      >
        <option value=''>분류</option>
        <option value='용접'>용접</option>
        <option value='가공'>가공</option>
        <option value='조립'>조립</option>
      </select>

      {/* 중요도 필터 */}
      <select
        className='p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]'
        value={advFilter.priority || ''}
        onChange={e =>
          onAdvancedFilterChange({ ...advFilter, priority: e.target.value })
        }
        aria-label="중요도 필터"
      >
        <option value=''>중요도</option>
        <option value='최상'>최상</option>
        <option value='상'>상</option>
        <option value='중'>중</option>
        <option value='하'>하</option>
        <option value='최하'>최하</option>
      </select>
    </div>
  );
};

export default ChecklistFilterBar;
