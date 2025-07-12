import React from 'react';

interface ChecklistInputFormProps {
  selectedPart: any;
  sections: Array<{ title: string; options: string[] }>;
  selectedChecklistSection: string;
  currentInput: {
    text: string;
    author: string;
    dueDate: string;
    options: string[];
    category: string;
    priority: string;
  };
  options: string[];
  onSectionChange: (section: string) => void;
  onInputChange: (patch: Partial<{
    text: string;
    author: string;
    dueDate: string;
    options: string[];
    category: string;
    priority: string;
  }>) => void;
  onAddItem: () => void;
}

const ChecklistInputForm: React.FC<ChecklistInputFormProps> = ({
  selectedPart,
  sections,
  selectedChecklistSection,
  currentInput,
  options,
  onSectionChange,
  onInputChange,
  onAddItem
}) => {
  if (!selectedPart) return null;

  return (
    <div className="mb-6 p-4 bg-white rounded shadow" style={{ maxWidth: 900, marginRight: 'auto', marginLeft: 0 }}>
      {/* Section selector */}
      <label className="block font-medium mb-1">Section:</label>
      <select
        className="w-full mb-2 p-1 border rounded"
        value={selectedChecklistSection}
        onChange={e => onSectionChange(e.target.value)}
      >
        {sections.map(sec => (
          <option key={sec.title} value={sec.title}>{sec.title}</option>
        ))}
      </select>
      
      {/* Item text */}
      <label className="block font-medium mb-1">Item text</label>
      <textarea
        className="w-full mb-2 p-1 border rounded"
        placeholder="Item text"
        value={currentInput.text}
        onChange={e => onInputChange({ text: e.target.value })}
        rows={5}
      />
      
      {/* 담당자/마감일 입력란 */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          className="flex-1 p-1 border rounded"
          placeholder="담당자"
          value={currentInput.author}
          onChange={e => onInputChange({ author: e.target.value })}
        />
        <input
          type="date"
          className="flex-1 p-1 border rounded"
          placeholder="마감일"
          value={currentInput.dueDate}
          onChange={e => onInputChange({ dueDate: e.target.value })}
        />
      </div>
      
      {/* 분류, 중요도 드롭다운 */}
      <div className="flex gap-2 mb-2">
        <select
          className="flex-1 p-1 border rounded"
          value={currentInput.category}
          onChange={e => onInputChange({ category: e.target.value })}
        >
          <option value="">분류 선택</option>
          <option value="용접">용접</option>
          <option value="가공">가공</option>
          <option value="조립">조립</option>
        </select>
        <select
          className="flex-1 p-1 border rounded"
          value={currentInput.priority}
          onChange={e => onInputChange({ priority: e.target.value })}
        >
          <option value="">중요도 선택</option>
          <option value="최상">최상</option>
          <option value="상">상</option>
          <option value="중">중</option>
          <option value="하">하</option>
          <option value="최하">최하</option>
        </select>
      </div>
      
      {/* Classification options */}
      <div className="flex flex-wrap gap-2 mb-2">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={currentInput.options.length === options.length}
            onChange={() => onInputChange({ 
              options: currentInput.options.length === options.length ? [] : options 
            })}
          />
          전체
        </label>
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={currentInput.options.includes(opt)}
              onChange={() => onInputChange({ 
                options: currentInput.options.includes(opt) 
                  ? currentInput.options.filter(o => o !== opt) 
                  : [...currentInput.options, opt] 
              })}
            />
            {opt}
          </label>
        ))}
      </div>
      
      {/* Add button */}
      <button 
        className="bg-blue-500 text-white py-1 px-3 rounded" 
        onClick={onAddItem}
      >
        Add Item
      </button>
    </div>
  );
};

export default ChecklistInputForm; 