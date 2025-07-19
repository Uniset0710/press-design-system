import React from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';

interface ChecklistInputFormProps {
  currentInput: {
    text: string;
    author: string;
    dueDate: string;
    options: string[];
    category: string;
    priority: string;
    section?: string; // 섹션 선택을 위한 필드 추가
  };
  setCurrentInput: (
    patch: Partial<{
      text: string;
      author: string;
      dueDate: string;
      options: string[];
      category: string;
      priority: string;
      section?: string;
    }>
  ) => void;
  onAdd: () => void;
  options: string[];
  allSelected: boolean;
  handleToggleAll: () => void;
  sections: { title: string; options: string[] }[]; // 섹션 목록 추가
  currentSectionIndex: number; // 현재 섹션 인덱스 추가
  isAdmin?: boolean;
}

const ChecklistInputForm: React.FC<ChecklistInputFormProps> = ({
  currentInput,
  setCurrentInput,
  onAdd,
  options,
  allSelected,
  handleToggleAll,
  sections,
  currentSectionIndex,
  isAdmin,
}) => {
  const categoryOptions = [
    { value: '', label: '분류 선택' },
    { value: '용접', label: '용접' },
    { value: '가공', label: '가공' },
    { value: '조립', label: '조립' },
  ];

  const priorityOptions = [
    { value: '', label: '중요도 선택' },
    { value: '최상', label: '최상' },
    { value: '상', label: '상' },
    { value: '중', label: '중' },
    { value: '하', label: '하' },
    { value: '최하', label: '최하' },
  ];

  const sectionOptions = sections.map(section => ({
    value: section.title,
    label: section.title,
  }));

  // 현재 섹션의 제목
  const currentSectionTitle = sections[currentSectionIndex]?.title || 'Design Check List';

  return (
    <div
      className='mb-6 p-4 bg-white rounded shadow'
      style={{ maxWidth: 900, marginRight: 'auto', marginLeft: 0 }}
      role="form"
      aria-label="체크리스트 항목 입력 폼"
    >
      {/* 섹션 선택 */}
      <div className='mb-2'>
        <label className='block font-medium mb-1' htmlFor="section-select">섹션 선택</label>
        <Select
          id="section-select"
          value={currentInput.section || currentSectionTitle}
          onChange={e => setCurrentInput({ section: e.target.value })}
          options={sectionOptions}
          aria-label="섹션을 선택하세요"
        />
      </div>

      {/* Item text */}
      <div className='mb-2'>
        <label className='block font-medium mb-1' htmlFor="item-text">Item text</label>
        <Textarea
          id="item-text"
          value={currentInput.text}
          onChange={e => setCurrentInput({ text: e.target.value })}
          placeholder='Item text'
          rows={5}
          aria-label="체크리스트 항목 내용을 입력하세요"
        />
      </div>

      {/* 담당자/마감일 입력란 */}
      <div className='flex gap-2 mb-2'>
        <Input
          type='text'
          placeholder='담당자'
          value={currentInput.author}
          onChange={e => setCurrentInput({ author: e.target.value })}
          aria-label="담당자 이름을 입력하세요"
        />
        <Input
          type='date'
          placeholder='마감일'
          value={currentInput.dueDate}
          onChange={e => setCurrentInput({ dueDate: e.target.value })}
          aria-label="마감일을 선택하세요"
        />
      </div>

      {/* 분류, 중요도 드롭다운 */}
      <div className='flex gap-2 mb-2'>
        <Select
          value={currentInput.category}
          onChange={e => setCurrentInput({ category: e.target.value })}
          options={categoryOptions}
          aria-label="분류를 선택하세요"
        />
        <Select
          value={currentInput.priority}
          onChange={e => setCurrentInput({ priority: e.target.value })}
          options={priorityOptions}
          aria-label="중요도를 선택하세요"
        />
      </div>

      {/* Classification options */}
      <fieldset className='flex flex-wrap gap-2 mb-2'>
        <legend className='sr-only'>분류 옵션 선택</legend>
        <label className='flex items-center gap-1'>
          <input
            type='checkbox'
            checked={allSelected}
            onChange={handleToggleAll}
            aria-label="모든 옵션 선택"
          />
          전체
        </label>
        {options.map(opt => (
          <label key={opt} className='flex items-center gap-1'>
            <input
              type='checkbox'
              checked={currentInput.options.includes(opt)}
              onChange={() =>
                setCurrentInput({
                  options: currentInput.options.includes(opt)
                    ? currentInput.options.filter(o => o !== opt)
                    : [...currentInput.options, opt],
                })
              }
              aria-label={`${opt} 옵션 선택`}
            />
            {opt}
          </label>
        ))}
      </fieldset>

      {/* Add button */}
      {isAdmin && (
        <Button
          onClick={onAdd}
          variant="primary"
          aria-label="체크리스트 항목 추가"
        >
          Add Item
        </Button>
      )}
    </div>
  );
};

export default ChecklistInputForm;
