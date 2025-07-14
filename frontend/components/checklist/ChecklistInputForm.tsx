import React from 'react';

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
}) => {
  return (
    <div
      className='mb-6 p-4 bg-white rounded shadow'
      style={{ maxWidth: 900, marginRight: 'auto', marginLeft: 0 }}
    >
      {/* 섹션 선택 */}
      <div className='mb-2'>
        <label className='block font-medium mb-1'>섹션 선택</label>
        <select
          className='w-full p-1 border rounded'
          value={currentInput.section || sections[currentSectionIndex]?.title || ''}
          onChange={e => setCurrentInput({ section: e.target.value })}
        >
          {sections.map((section, idx) => (
            <option key={section.title} value={section.title}>
              {section.title}
            </option>
          ))}
        </select>
      </div>

      {/* Item text */}
      <label className='block font-medium mb-1'>Item text</label>
      <textarea
        className='w-full mb-2 p-1 border rounded'
        placeholder='Item text'
        value={currentInput.text}
        onChange={e => setCurrentInput({ text: e.target.value })}
        rows={5}
      />

      {/* 담당자/마감일 입력란 */}
      <div className='flex gap-2 mb-2'>
        <input
          type='text'
          className='flex-1 p-1 border rounded'
          placeholder='담당자'
          value={currentInput.author}
          onChange={e => setCurrentInput({ author: e.target.value })}
        />
        <input
          type='date'
          className='flex-1 p-1 border rounded'
          placeholder='마감일'
          value={currentInput.dueDate}
          onChange={e => setCurrentInput({ dueDate: e.target.value })}
        />
      </div>

      {/* 분류, 중요도 드롭다운 */}
      <div className='flex gap-2 mb-2'>
        <select
          className='flex-1 p-1 border rounded'
          value={currentInput.category}
          onChange={e => setCurrentInput({ category: e.target.value })}
        >
          <option value=''>분류 선택</option>
          <option value='용접'>용접</option>
          <option value='가공'>가공</option>
          <option value='조립'>조립</option>
        </select>
        <select
          className='flex-1 p-1 border rounded'
          value={currentInput.priority}
          onChange={e => setCurrentInput({ priority: e.target.value })}
        >
          <option value=''>중요도 선택</option>
          <option value='최상'>최상</option>
          <option value='상'>상</option>
          <option value='중'>중</option>
          <option value='하'>하</option>
          <option value='최하'>최하</option>
        </select>
      </div>

      {/* Classification options */}
      <div className='flex flex-wrap gap-2 mb-2'>
        <label className='flex items-center gap-1'>
          <input
            type='checkbox'
            checked={allSelected}
            onChange={handleToggleAll}
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
            />
            {opt}
          </label>
        ))}
      </div>

      {/* Add button */}
      <button
        className='bg-blue-500 text-white py-1 px-3 rounded'
        onClick={onAdd}
      >
        Add Item
      </button>
    </div>
  );
};

export default ChecklistInputForm;
