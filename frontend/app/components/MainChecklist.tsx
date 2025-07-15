'use client';
import React, { useState, useEffect } from 'react';
import { ChecklistItem, AttachmentData } from '@/app/types/checklist';
import { Part } from './TreeView';
import ChecklistTableContainer from '../../components/checklist/ChecklistTableContainer';
import ChecklistItemModal from '../../components/modal/ChecklistItemModal';
import ChecklistInputForm from '../../components/checklist/ChecklistInputForm';
import ChecklistFilterBar from '../../components/checklist/ChecklistFilterBar';
import { useChecklistFilter } from '../../hooks/useChecklistFilter';
import { useTreeSearch } from '../../hooks/useTreeSearch';
import { useChecklistData } from '../../hooks/useChecklistData';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import ItemToolbar from '../../components/checklist/ItemToolbar';

interface MainChecklistProps {
  selectedPart: Part | null;
  selectedPartId: string;
  checklistData: Record<string, ChecklistItem[]>;
  setChecklistData: (data: Record<string, ChecklistItem[]>) => void;
  mutateChecklist?: (...args: any[]) => void;
  attachmentsCache: Record<string, AttachmentData[]>;
  setAttachmentsCache: (cache: Record<string, AttachmentData[]>) => void;
  onFileUpload: (file: File, item: ChecklistItem) => Promise<void>;
  onDeleteAttachment: (attachmentId: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function MainChecklist({
  selectedPart,
  selectedPartId,
  checklistData,
  setChecklistData,
  mutateChecklist,
  attachmentsCache,
  setAttachmentsCache,
  onFileUpload,
  onDeleteAttachment,
  isAdmin,
}: MainChecklistProps) {
  const { data: session } = useSession();
  const [modalItem, setModalItem] = useState<ChecklistItem | null>(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const sections = [
    {
      title: 'Design Check List',
      options: ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'],
    },
    {
      title: 'Machining Check List',
      options: ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'],
    },
    {
      title: 'Assembly Check List',
      options: ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'],
    },
  ];

  const [selectedChecklistSection, setSelectedChecklistSection] = useState<string>(sections[0].title);
  const [newChecklistText, setNewChecklistText] = useState<string>('');
  const [newChecklistOptions, setNewChecklistOptions] = useState<string[]>([]);
  const [newChecklistAuthor, setNewChecklistAuthor] = useState<string>('');
  const [newChecklistDueDate, setNewChecklistDueDate] = useState<string>('');

  const options = ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'];
  const [selectedOptions, setSelectedOptions] = useState<string[]>(options);
  const [sectionFilters, setSectionFilters] = useState<Record<string, string>>({});
  const [sectionSort, setSectionSort] = useState<
    Record<
      string,
      {
        column: 'author' | 'dueDate' | 'category' | 'priority' | null;
        order: 'asc' | 'desc';
      }
    >
  >({});
  const [sectionAdvancedFilters, setSectionAdvancedFilters] = useState<
    Record<
      string,
      {
        author: string;
        startDate: string;
        endDate: string;
        category: string;
        priority: string;
      }
    >
  >({});

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    setCurrentSectionIndex(0);
  }, [selectedPartId]);

  const [sectionInput, setSectionInput] = useState<
    Record<
      string,
      {
        text: string;
        author: string;
        dueDate: string;
        options: string[];
        category: string;
        priority: string;
        section?: string;
      }
    >
  >({});

  // 현재 섹션의 입력 상태를 가져오는 함수
  const getCurrentSectionInput = () => {
    return sectionInput[sections[currentSectionIndex].title] || {
      text: '', author: '', dueDate: '', options: [], category: '', priority: ''
    };
  };

  // 현재 섹션의 allSelected 상태
  const allSelected = options.every(opt => getCurrentSectionInput().options.includes(opt));
  
  const handleToggleAll = () => {
    const currentInput = getCurrentSectionInput();
    const newOptions = allSelected ? [] : options;
    setSectionInput(prev => ({
      ...prev,
      [sections[currentSectionIndex].title]: {
        ...currentInput,
        options: newOptions,
      },
    }));
  };

  const allOptions = ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'];
  const allOptionsSelected = allOptions.every(opt => selectedOptions.includes(opt));
  const handleToggleAllOptions = () => {
    setSelectedOptions(allOptionsSelected ? [] : allOptions);
  };

  const handleSort = (
    sectionTitle: string,
    column: 'author' | 'dueDate' | 'category' | 'priority'
  ) => {
    setSectionSort(s => {
      const prev = s[sectionTitle];
      let nextOrder: 'asc' | 'desc' = 'asc';
      if (prev?.column === column)
        nextOrder = prev.order === 'asc' ? 'desc' : 'asc';
      return { ...s, [sectionTitle]: { column, order: nextOrder } };
    });
  };

  const goToPrevSection = () => setCurrentSectionIndex(i => Math.max(0, i - 1));
  const goToNextSection = () =>
    setCurrentSectionIndex(i => Math.min(sections.length - 1, i + 1));

  const dragStartX = React.useRef<number | null>(null);
  const handleSectionDragStart = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
  };
  const handleSectionDragEnd = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0 && currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(i => i + 1);
      } else if (delta > 0 && currentSectionIndex > 0) {
        setCurrentSectionIndex(i => i - 1);
      }
    }
    dragStartX.current = null;
  };

  const currentInput = sectionInput[selectedChecklistSection] || {
    text: '',
    author: '',
    dueDate: '',
    options: [],
    category: '',
    priority: '',
  };

  const setCurrentInput = (patch: Partial<typeof currentInput>) => {
    setSectionInput(prev => ({
      ...prev,
      [selectedChecklistSection]: { ...currentInput, ...patch },
    }));
  };

  const handleAddChecklistWithSection = async (sectionTitle: string) => {
    const input = getCurrentSectionInput(); // 현재 섹션의 입력 데이터 사용
    if (!input?.text.trim() || !selectedPart) return;

    try {
      const response = await fetch(`/api/checklist/${selectedPart.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({
          optionType: input.options[0] || 'DTL', // 첫 번째 옵션을 optionType으로 사용
          description: input.text,
          section: sectionTitle,
          author: input.author || session?.user?.name || 'Unknown',
          dueDate: input.dueDate || null,
          category: input.category || 'General',
          priority: input.priority || 'Medium',
        }),
      });

      // 디버깅: 응답 상태 및 본문 출력
      console.log('Checklist POST status:', response.status);
      const respText = await response.text();
      console.log('Checklist POST response:', respText);
      if (!response.ok) {
        throw new Error('Failed to add checklist item');
      }

      const newItem = JSON.parse(respText);
      
      // 새 항목에 optionType 추가하여 필터링이 정상 동작하도록 함
      const itemWithOptionType = {
        ...newItem,
        optionType: input.options[0] || 'DTL',
      };

      setChecklistData((prev: Record<string, ChecklistItem[]>) => ({
        ...prev,
        [sectionTitle]: [...(prev[sectionTitle] || []), itemWithOptionType],
      }));

      setSectionInput(prev => ({
        ...prev,
        [sections[currentSectionIndex].title]: {
          text: '',
          author: '',
          dueDate: '',
          options: [],
          category: '',
          priority: '',
          section: '',
        },
      }));

      toast.success('Checklist item added successfully');
    } catch (error) {
      console.error('Error adding checklist item:', error);
      toast.error('Failed to add checklist item');
    }
  };

  const handleStartEdit = (id: string) => {
    const item = Object.values(checklistData)
      .flat()
      .find(item => item.id === id);
    if (item) {
      setModalItem(item);
      setModalEditMode(false); // 상세 보기 모드로 시작
    }
  };

  const handleCancelEdit = () => {
    setModalItem(null);
    setModalEditMode(false);
    setImagePreview(null);
  };

  const handleEditChecklist = async (
    itemId: string,
    newText: string,
    newAuthor?: string,
    newDueDate?: string,
    newCategory?: string,
    newPriority?: string
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/checklist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newText,
          author: newAuthor,
          dueDate: newDueDate,
          category: newCategory,
          priority: newPriority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update checklist item');
      }

      const updatedItem = await response.json();
      setChecklistData((prev: Record<string, ChecklistItem[]>) => {
        const newData = { ...prev };
        Object.keys(newData).forEach(section => {
          newData[section] = newData[section].map((item: ChecklistItem) =>
            item.id === itemId ? updatedItem : item
          );
        });
        return newData;
      });

      toast.success('Checklist item updated successfully');
    } catch (error) {
      console.error('Error updating checklist item:', error);
      toast.error('Failed to update checklist item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    // 삭제 확인
    const isConfirmed = window.confirm('정말로 이 체크리스트 항목을 삭제하시겠습니까?');
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/checklist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete checklist item');
      }

      setChecklistData((prev: Record<string, ChecklistItem[]>) => {
        const newData = { ...prev };
        Object.keys(newData).forEach(section => {
          newData[section] = newData[section].filter((item: ChecklistItem) => item.id !== itemId);
        });
        return newData;
      });

      // 모달 닫기
      setModalItem(null);
      setModalEditMode(false);
      setImagePreview(null);

      toast.success('Checklist item deleted successfully');
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      toast.error('Failed to delete checklist item');
    }
  };

  function exportToCSV(sectionTitle: string, items: ChecklistItem[]) {
    const headers = ['Text', 'Author', 'Due Date', 'Category', 'Priority', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        `"${item.text.replace(/"/g, '""')}"`,
        `"${item.author || ''}"`,
        `"${item.dueDate || ''}"`,
        `"${item.category || ''}"`,
        `"${item.priority || ''}"`,
        `"${item.completed ? 'Completed' : 'Pending'}"`,
        `"${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${sectionTitle}_${selectedPart?.name || 'checklist'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportToXLSX(sectionTitle: string, items: ChecklistItem[]) {
    const worksheet = XLSX.utils.json_to_sheet(
      items.map(item => ({
        Text: item.text,
        Author: item.author || '',
        'Due Date': item.dueDate || '',
        Category: item.category || '',
        Priority: item.priority || '',
        Status: item.completed ? 'Completed' : 'Pending',
        'Created At': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sectionTitle);
    XLSX.writeFile(workbook, `${sectionTitle}_${selectedPart?.name || 'checklist'}.xlsx`);
  }

  // selectedPart가 없으면 안내 메시지
  if (!selectedPart) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Part
          </h3>
          <p className="text-gray-500">
            Choose a part from the tree to view its checklist
          </p>
        </div>
      </div>
    );
  }

  // selectedPart가 있을 때 전체 UI 렌더링
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* 파트명/ID */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedPart.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Part ID: {selectedPart.id}
            </p>
          </div>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="p-4 border-b border-gray-100">
        <ChecklistInputForm
          currentInput={currentInput}
          setCurrentInput={setCurrentInput}
          onAdd={() => handleAddChecklistWithSection(selectedChecklistSection)}
          options={options}
          allSelected={allSelected}
          handleToggleAll={handleToggleAll}
          sections={sections}
          currentSectionIndex={currentSectionIndex}
          isAdmin={isAdmin}
        />
      </div>

      {/* 옵션 탭 */}
      <div className="flex flex-row items-center gap-2 px-4 py-2 border-b border-gray-100">
        <span className="font-medium">Options:</span>
        {options.map(opt => (
          <label key={opt} className="inline-flex items-center mr-2">
            <input
              type="checkbox"
              checked={selectedOptions.includes(opt)}
              onChange={() =>
                setSelectedOptions(selectedOptions.includes(opt)
                  ? selectedOptions.filter(o => o !== opt)
                  : [...selectedOptions, opt])
              }
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="ml-1 text-sm">{opt}</span>
          </label>
        ))}
        <button
          onClick={handleToggleAllOptions}
          className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded"
        >
          {allOptionsSelected ? 'Unselect All' : 'Select All'}
        </button>
      </div>

      {/* 섹션 탭(고정형 3분할) */}
      <div className="flex flex-row border-b border-gray-200 bg-gray-50">
        {sections.map((section, idx) => (
          <button
            key={section.title}
            onClick={() => setCurrentSectionIndex(idx)}
            className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150
              ${currentSectionIndex === idx ? 'border-blue-500 text-blue-600 bg-white font-bold shadow-sm' : 'border-transparent text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
            style={{ borderRadius: idx === 0 ? '8px 0 0 0' : idx === sections.length - 1 ? '0 8px 0 0' : '0' }}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* 테이블 (섹션별 컨텐츠) */}
      <div className="flex-1 overflow-hidden px-4 py-6">
        <div className="w-full h-full overflow-auto">
          <ChecklistTableContainer
            items={checklistData[sections[currentSectionIndex].title] || []}
            sectionTitle={sections[currentSectionIndex].title}
            selectedOptions={selectedOptions}
            sectionFilters={sectionFilters}
            sectionSort={sectionSort}
            onSort={handleSort}
            onItemClick={(item) => handleStartEdit(item.id)}
            selectedPart={selectedPart}
            onExportXLSX={exportToXLSX}
          />
        </div>
      </div>

      {/* 슬라이드 네비게이션 버튼 */}
      <div className="flex justify-between items-center p-4 border-t border-gray-200">
        <button
          onClick={goToPrevSection}
          disabled={currentSectionIndex === 0}
          className={`px-4 py-2 rounded ${
            currentSectionIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          이전
        </button>
        <div className="flex space-x-2">
          {sections.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSectionIndex(idx)}
              className={`w-3 h-3 rounded-full ${
                currentSectionIndex === idx ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <button
          onClick={goToNextSection}
          disabled={currentSectionIndex === sections.length - 1}
          className={`px-4 py-2 rounded ${
            currentSectionIndex === sections.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          다음
        </button>
      </div>

      {/* 모달 */}
      {modalItem && (
        <ChecklistItemModal
          modalItem={modalItem}
          modalEditMode={modalEditMode}
          imagePreview={imagePreview}
          onClose={handleCancelEdit}
          onEditModeToggle={() => setModalEditMode(!modalEditMode)}
          onSave={() => {
            // 저장 로직은 이미 handleEditChecklist에서 처리됨
            setModalEditMode(false);
          }}
          onDelete={() => handleDeleteItem(modalItem.id)}
          onItemChange={(updatedItem) => setModalItem(updatedItem)}
          onFileUpload={(file) => onFileUpload(file, modalItem)}
          onDeleteAttachment={onDeleteAttachment}
          onImagePreview={setImagePreview}
          onImagePreviewClose={() => setImagePreview(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
} 