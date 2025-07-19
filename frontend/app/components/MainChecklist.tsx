'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
import { getModelFromCookies } from '@/utils/cookieUtils';
import { useModelOptions } from '@/hooks/useModelOptions';

// 쿠키에서 모델 ID를 가져오는 함수
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

interface MainChecklistProps {
  selectedPart: Part | null;
  selectedPartId: string;
  checklistData: Record<string, ChecklistItem[]>;
  setChecklistData: React.Dispatch<React.SetStateAction<Record<string, ChecklistItem[]>>>;
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

  // 모델 정보 가져오기
  const modelInfo = getModelFromCookies();

  // 동적 옵션 로딩
  const { options: designOptions, loading: designLoading } = useModelOptions(
    modelInfo?.code || '',
    'Design Check List'
  );
  const { options: machiningOptions, loading: machiningLoading } = useModelOptions(
    modelInfo?.code || '',
    'Machining Check List'
  );
  const { options: assemblyOptions, loading: assemblyLoading } = useModelOptions(
    modelInfo?.code || '',
    'Assembly Check List'
  );

  // 동적으로 sections 생성
  const sections = useMemo(() => [
    {
      title: 'Design Check List',
      options: designOptions.map(opt => opt.optionCode),
      loading: designLoading
    },
    {
      title: 'Machining Check List',
      options: machiningOptions.map(opt => opt.optionCode),
      loading: machiningLoading
    },
    {
      title: 'Assembly Check List',
      options: assemblyOptions.map(opt => opt.optionCode),
      loading: assemblyLoading
    }
  ], [designOptions, machiningOptions, assemblyOptions, designLoading, machiningLoading, assemblyLoading]);

  // 기본 옵션 (로딩 중이거나 옵션이 없을 때 사용)
  const defaultOptions = ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'];

  const [selectedChecklistSection, setSelectedChecklistSection] = useState<string>(sections[0]?.title || 'Design Check List');
  const [newChecklistText, setNewChecklistText] = useState<string>('');
  const [newChecklistOptions, setNewChecklistOptions] = useState<string[]>([]);
  const [newChecklistAuthor, setNewChecklistAuthor] = useState<string>('');
  const [newChecklistDueDate, setNewChecklistDueDate] = useState<string>('');

  // 현재 섹션의 옵션들 (로딩 중이면 기본 옵션 사용)
  const currentSectionOptions = useMemo(() => {
    const currentSection = sections.find(s => s.title === selectedChecklistSection);
    if (currentSection?.loading || !currentSection?.options.length) {
      return defaultOptions;
    }
    return currentSection.options;
  }, [sections, selectedChecklistSection]);

  const [selectedOptions, setSelectedOptions] = useState<string[]>(currentSectionOptions);
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

  // 현재 섹션이 변경되면 selectedOptions 업데이트
  useEffect(() => {
    setSelectedOptions(currentSectionOptions);
  }, [currentSectionOptions]);

  // 섹션 인덱스가 변경되면 selectedChecklistSection도 업데이트
  useEffect(() => {
    const currentSection = sections[currentSectionIndex];
    if (currentSection) {
      setSelectedChecklistSection(currentSection.title);
    }
  }, [currentSectionIndex, sections]);

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
    const currentSectionTitle = sections[currentSectionIndex]?.title || 'Design Check List';
    return sectionInput[currentSectionTitle] || {
      text: '', author: '', dueDate: '', options: [], category: '', priority: ''
    };
  };

  // 현재 섹션의 allSelected 상태
  const allSelected = currentSectionOptions.every(opt => getCurrentSectionInput().options.includes(opt));
  
  const handleToggleAll = () => {
    const currentInput = getCurrentSectionInput();
    const newOptions = allSelected ? [] : currentSectionOptions;
    const currentSectionTitle = sections[currentSectionIndex]?.title || 'Design Check List';
    setSectionInput(prev => ({
      ...prev,
      [currentSectionTitle]: {
        ...currentInput,
        options: newOptions,
      },
    }));
  };

  const allOptionsSelected = currentSectionOptions.every(opt => selectedOptions.includes(opt));
  const handleToggleAllOptions = () => {
    setSelectedOptions(allOptionsSelected ? [] : currentSectionOptions);
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
    // 전달된 섹션의 입력 데이터를 사용
    const input = sectionInput[sectionTitle] || {
      text: '', author: '', dueDate: '', options: [], category: '', priority: ''
    };
    
    if (!input?.text.trim() || !selectedPart) return;

    try {
      // 모델 코드를 쿼리 파라미터로 추가
      const modelInfo = getModelFromCookies();
      const modelCode = modelInfo.code;
      const url = modelCode 
        ? `/api/checklist/${selectedPart.id}?modelId=${modelCode}`
        : `/api/checklist/${selectedPart.id}`;
        
      // 다중 옵션을 쉼표로 구분하여 전송
      const optionTypes = input.options.length > 0 ? input.options.join(',') : 'DTL';
        
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({
          optionType: optionTypes, // 다중 옵션 지원
          description: input.text,
          section: sectionTitle,
          author: input.author || session?.user?.name || 'Unknown',
          dueDate: input.dueDate || null,
          category: input.category || 'General',
          priority: input.priority || 'Medium',
          modelId: modelCode // 모델 코드 추가
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add checklist item');
      }

      const newItem = await response.json();
      
      // 새 아이템을 해당 섹션에 추가
      setChecklistData((prev: Record<string, ChecklistItem[]>) => {
        const updated: Record<string, ChecklistItem[]> = { ...prev };
        // 섹션별로 분리된 데이터 구조에 맞게 추가
        const sectionKey = sectionTitle;
        if (!updated[sectionKey]) {
          updated[sectionKey] = [];
        }
        updated[sectionKey] = [...updated[sectionKey], {
          ...newItem,
          text: newItem.text || newItem.description,
          optionType: optionTypes
        }];
        return updated;
      });

      // 입력 폼 초기화
      setSectionInput(prev => ({
        ...prev,
        [sectionTitle]: {
          text: '',
          author: '',
          dueDate: '',
          options: [],
          category: '',
          priority: '',
        },
      }));

      toast.success('체크리스트 항목이 추가되었습니다.');
    } catch (error) {
      console.error('체크리스트 추가 오류:', error);
      toast.error('체크리스트 항목 추가에 실패했습니다.');
    }
  };

  const handleStartEdit = (itemId: string) => {
    const currentSectionTitle = sections[currentSectionIndex]?.title || 'Design Check List';
    const items = checklistData[currentSectionTitle] || [];
    const item = items.find(item => item.id === itemId);
    if (item) {
      setModalItem(item);
      setModalEditMode(false); // 상세보기 모드로 열기
    }
  };

  const handleModalClose = () => {
    setModalItem(null);
    setModalEditMode(false);
    setImagePreview(null);
  };

  const handleModalSave = async (updatedItem: ChecklistItem) => {
    if (!selectedPart) return;

    try {
      // 첨부파일 데이터를 제외하고 체크리스트 데이터만 전송
      const { attachments, ...checklistData } = updatedItem;
      
      const response = await fetch(`/api/checklist/${updatedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify(checklistData),
      });

      if (!response.ok) {
        throw new Error('Failed to update checklist item');
      }

      const updatedData = await response.json();
      
      setChecklistData((prev: Record<string, ChecklistItem[]>) => {
        const updated: Record<string, ChecklistItem[]> = { ...prev };
        const currentSectionTitle = sections[currentSectionIndex]?.title || 'Design Check List';
        if (updated[currentSectionTitle]) {
          updated[currentSectionTitle] = updated[currentSectionTitle].map(item =>
            item.id === updatedItem.id ? { ...item, ...updatedData } : item
          );
        }
        return updated;
      });

      handleModalClose();
      toast.success('체크리스트 항목이 수정되었습니다.');
    } catch (error) {
      console.error('체크리스트 수정 오류:', error);
      toast.error('체크리스트 항목 수정에 실패했습니다.');
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
        const newData: Record<string, ChecklistItem[]> = { ...prev };
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

  const exportToXLSX = () => {
    const currentSectionTitle = sections[currentSectionIndex]?.title || 'Design Check List';
    const items = checklistData[currentSectionTitle] || [];
    
    if (items.length === 0) {
      toast.error('내보낼 데이터가 없습니다.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(items);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, currentSectionTitle);
    
    const fileName = `${selectedPart?.name || 'checklist'}_${currentSectionTitle.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('엑셀 파일이 다운로드되었습니다.');
  };

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

  // 옵션 로딩 중일 때 로딩 표시
  const isLoading = designLoading || machiningLoading || assemblyLoading;
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">옵션을 불러오는 중...</p>
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
          onAdd={() => handleAddChecklistWithSection(sections[currentSectionIndex]?.title || 'Design Check List')}
          options={currentSectionOptions}
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
        {currentSectionOptions.map(opt => (
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
            {section.loading && (
              <span className="ml-2 inline-block w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></span>
            )}
          </button>
        ))}
      </div>

      {/* 테이블 (섹션별 컨텐츠) */}
      <div className="flex-1 overflow-hidden px-4 py-6">
        <div className="w-full h-full overflow-auto">
          {/* 필터바 추가 */}
          <div className="px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 mb-2">
            <ChecklistFilterBar
              sectionTitle={sections[currentSectionIndex]?.title || 'Design Check List'}
              filterValue={sectionFilters[sections[currentSectionIndex]?.title || 'Design Check List'] || ''}
              advFilter={sectionAdvancedFilters[sections[currentSectionIndex]?.title || 'Design Check List'] || {
                author: '',
                startDate: '',
                endDate: '',
                category: '',
                priority: ''
              }}
              authors={Array.from(new Set(
                (checklistData[sections[currentSectionIndex]?.title || 'Design Check List'] || [])
                  .map(item => item.author)
                  .filter((author): author is string => Boolean(author))
              ))}
              onFilterChange={(value) => {
                setSectionFilters(prev => ({
                  ...prev,
                  [sections[currentSectionIndex]?.title || 'Design Check List']: value
                }));
              }}
              onAdvancedFilterChange={(filter) => {
                setSectionAdvancedFilters(prev => ({
                  ...prev,
                  [sections[currentSectionIndex]?.title || 'Design Check List']: filter
                }));
              }}
            />
          </div>
          
          <ChecklistTableContainer
            items={checklistData[sections[currentSectionIndex]?.title || 'Design Check List'] || []}
            sectionTitle={sections[currentSectionIndex]?.title || 'Design Check List'}
            selectedOptions={selectedOptions}
            sectionFilters={sectionFilters}
            sectionAdvancedFilters={sectionAdvancedFilters}
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
          onClose={handleModalClose}
          onEditModeToggle={() => setModalEditMode(!modalEditMode)}
          onSave={async () => {
            if (modalItem) {
              await handleModalSave(modalItem);
            }
          }}
          onDelete={async () => {
            if (modalItem) {
              try {
                const response = await fetch(`/api/checklist/${modalItem.id}`, {
                  method: 'DELETE',
                  headers: {
                    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
                    'Content-Type': 'application/json',
                  },
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                
                if (result.success) {
                  toast.success('체크리스트 항목이 삭제되었습니다.');
                  
                  // 로컬 상태에서 삭제된 항목 제거
                  setChecklistData(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(section => {
                      updated[section] = updated[section].filter(item => item.id !== modalItem.id);
                    });
                    return updated;
                  });
                  
                  // 모달 닫기
                  handleModalClose();
                } else {
                  toast.error('삭제에 실패했습니다.');
                }
              } catch (error) {
                console.error('Delete error:', error);
                toast.error('삭제 중 오류가 발생했습니다.');
              }
            }
          }}
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