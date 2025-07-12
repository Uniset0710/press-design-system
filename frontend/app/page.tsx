'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import TreeView, { PressNode, Part } from '../components/tree/TreeView';
import ChecklistItemComponent from '../components/ChecklistItemComponent';
import { v4 as uuid } from 'uuid';
import { ChecklistItem, AttachmentData } from '@/app/types/checklist';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import CommentSection from './components/CommentSection';
import HistorySection from './components/HistorySection';
import ChecklistTableContainer from '../components/checklist/ChecklistTableContainer';
import ChecklistItemModal from '../components/modal/ChecklistItemModal';
import ChecklistInputForm from '../components/checklist/ChecklistInputForm';
import ChecklistFilterBar from '../components/checklist/ChecklistFilterBar';
import { useChecklistFilter } from '../hooks/useChecklistFilter';
import { useTreeSearch } from '../hooks/useTreeSearch';
import { useChecklistData } from '../hooks/useChecklistData';
import {
  ChecklistProvider,
  useChecklistContext,
} from '../context/ChecklistContext';

type TreeData = PressNode[];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

interface CachedChecklist {
  data: Record<string, ChecklistItem[]>;
  fetchedAt: number;
}

function PageContent() {
  const { data: session, status } = useSession();
  console.log('useSession status:', status, session);
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TreeData>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const { checklistData, setChecklistData, mutateChecklist } = useChecklistData(
    selectedPartId,
    session
  );
  const [attachmentsCache, setAttachmentsCache] = useState<
    Record<string, AttachmentData[]>
  >({});
  const [newPartName, setNewPartName] = useState<string>('');
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<string>('');
  const [newAssemblyName, setNewAssemblyName] = useState<string>('');
  const [sidebarWidth, setSidebarWidth] = useState<number>(350);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isChecklistEditMode, setIsChecklistEditMode] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
  const [selectedChecklistSection, setSelectedChecklistSection] =
    useState<string>(sections[0].title);
  const [newChecklistText, setNewChecklistText] = useState<string>('');
  const [newChecklistOptions, setNewChecklistOptions] = useState<string[]>([]);

  // Top-level grouping options
  const options = ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'];
  // Initialize selectedOptions with all to show all codes by default
  const [selectedOptions, setSelectedOptions] = useState<string[]>(options);

  // 섹션별 필터 상태 추가
  const [sectionFilters, setSectionFilters] = useState<Record<string, string>>(
    {}
  );

  // 새 체크리스트 항목 추가용 상태 추가
  const [newChecklistAuthor, setNewChecklistAuthor] = useState<string>('');
  const [newChecklistDueDate, setNewChecklistDueDate] = useState<string>('');

  // 섹션별 정렬 상태 추가
  const [sectionSort, setSectionSort] = useState<
    Record<
      string,
      {
        column: 'author' | 'dueDate' | 'category' | 'priority' | null;
        order: 'asc' | 'desc';
      }
    >
  >({});

  // 섹션별 필터 상태 추가 (기존 sectionFilters 외에 담당자/날짜/키워드)
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

  // 모달 상태: 상세/수정 모드 분리
  const [modalItem, setModalItem] = useState<ChecklistItem | null>(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 전체 선택/해제 핸들러
  const allSelected = options.every(opt => newChecklistOptions.includes(opt));
  const handleToggleAll = () => {
    setNewChecklistOptions(allSelected ? [] : options);
  };

  const allOptions = ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'];
  const allOptionsSelected = allOptions.every(opt =>
    selectedOptions.includes(opt)
  );
  const handleToggleAllOptions = () => {
    setSelectedOptions(allOptionsSelected ? [] : allOptions);
  };

  // 정렬 핸들러 추가
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

  // 섹션 인덱스 상태 추가
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const goToPrevSection = () => setCurrentSectionIndex(i => Math.max(0, i - 1));
  const goToNextSection = () =>
    setCurrentSectionIndex(i => Math.min(sections.length - 1, i + 1));

  // 드래그로 섹션 전환
  const dragStartX = useRef<number | null>(null);
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

  // 섹션 슬라이드 스타일 제거
  // const sectionSliderStyle = {
  //   width: '100%',
  //   display: 'flex',
  //   transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  //   transform: `translateX(-${currentSectionIndex * 100}%)`,
  // };
  // const sectionItemStyle = {
  //   width: '100%',
  //   flexShrink: 0,
  // };

  // 섹션별 입력값 상태로 변경
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
      }
    >
  >(() =>
    Object.fromEntries(
      sections.map(sec => [
        sec.title,
        {
          text: '',
          author: '',
          dueDate: '',
          options: [],
          category: '',
          priority: '',
        },
      ])
    )
  );

  // 현재 섹션의 입력값을 쉽게 가져오기
  const currentSectionTitle = sections[currentSectionIndex].title;
  const currentInput = sectionInput[currentSectionTitle] || {
    text: '',
    author: '',
    dueDate: '',
    options: [],
    category: '',
    priority: '',
  };

  // 입력값 변경 핸들러
  const setCurrentInput = (patch: Partial<typeof currentInput>) => {
    setSectionInput(prev => ({
      ...prev,
      [currentSectionTitle]: { ...prev[currentSectionTitle], ...patch },
    }));
  };

  const fetchTreeData = async (): Promise<TreeData> => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`http://localhost:3002/api/tree`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch tree data');
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error fetching tree data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTreeData().then(data => setTreeData(data));
    }
  }, [status, session]);

  useEffect(() => {
    const filteredData = treeData
      .map(node => ({
        ...node,
        assemblies: node.assemblies
          .map(asm => ({
            ...asm,
            parts: asm.parts.filter(p =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
          }))
          .filter(
            asm =>
              asm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              asm.parts.length > 0
          ),
      }))
      .filter(
        node =>
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.assemblies.length > 0
      );

    setTreeData(filteredData);
  }, [searchTerm]);

  const handleAddPart = async () => {
    if (!selectedAssemblyId || !newPartName) return;
    await fetch(`/api/tree`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assemblyId: selectedAssemblyId,
        name: newPartName,
      }),
    });
    const updated = await fetchTreeData();
    setTreeData(updated);
    setNewPartName('');
    setSelectedAssemblyId('');
  };

  const handlePartSelect = (part: Part) => {
    setSelectedPart(part);
    setSelectedPartId(part.id);
  };

  const handleEditPart = async (partId: string, newName: string) => {
    const resp = await fetch(`/api/tree`, {
      credentials: 'include',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partId, name: newName }),
    });
    if (resp.ok) setTreeData(await fetchTreeData());
  };

  const handleEditAssembly = async (assemblyId: string, newName: string) => {
    const resp = await fetch(`/api/tree`, {
      credentials: 'include',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assemblyId, name: newName }),
    });
    if (resp.ok) setTreeData(await fetchTreeData());
  };

  const handleDelete = async (type: 'part' | 'assembly', id: string) => {
    // Confirm deletion
    const itemType = type === 'assembly' ? '어셈블리' : '파트';
    if (!window.confirm(`${itemType}을(를) 정말 삭제하시겠습니까?`)) return;
    const resp = await fetch(`/api/tree`, {
      credentials: 'include',
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    });
    if (resp.ok) setTreeData(await fetchTreeData());
  };

  const handleReorder = async (
    type: 'moveAssembly' | 'movePart',
    payload: any
  ) => {
    const resp = await fetch(`/api/tree`, {
      credentials: 'include',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...payload }),
    });
    if (resp.ok) setTreeData(await fetchTreeData());
  };

  const handleAddAssembly = async () => {
    if (!newAssemblyName || treeData.length === 0) return;
    const rootNodeId = treeData[0].id;
    await fetch(`/api/tree`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId: rootNodeId, name: newAssemblyName }),
    });
    const updated = await fetchTreeData();
    setTreeData(updated);
    setNewAssemblyName('');
  };

  // Mouse-down handler to start resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth =
      sidebarRef.current?.getBoundingClientRect().width ?? sidebarWidth;
    document.body.style.cursor = 'ew-resize';

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = startWidth + delta;
      // clamp width between 200 and 600px
      setSidebarWidth(Math.max(200, Math.min(600, newWidth)));
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleAddChecklistWithSection = (sectionTitle: string) => {
    if (
      !selectedPart ||
      !sectionInput[sectionTitle].text ||
      sectionInput[sectionTitle].options.length === 0
    )
      return;
    for (const optionType of sectionInput[sectionTitle].options) {
      try {
        fetch(`/api/checklist/${selectedPartId}`, {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            optionType,
            description: sectionInput[sectionTitle].text,
            section: sectionTitle,
            author: sectionInput[sectionTitle].author,
            dueDate: sectionInput[sectionTitle].dueDate,
            category: sectionInput[sectionTitle].category,
            priority: sectionInput[sectionTitle].priority,
          }),
        }).then(async response => {
          if (response.ok) {
            const newItem = await response.json();
            setChecklistData(prev => {
              const next = { ...prev };
              next[optionType] = [
                ...(next[optionType] ?? []),
                { ...newItem, attachments: [] },
              ];
              return next;
            });
          }
        });
      } catch (error) {
        console.error('Error adding checklist item:', error);
      }
    }
    setSectionInput(prev => ({
      ...prev,
      [sectionTitle]: {
        ...prev[sectionTitle],
        text: '',
        author: '',
        dueDate: '',
        options: [],
        category: '',
        priority: '',
      },
    }));
  };

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemText, setEditItemText] = useState<string>('');

  const handleStartEdit = (id: string) => {
    const item = Object.values(checklistData)
      .flat()
      .find(item => item.id === id);
    if (item) {
      setEditingItemId(id);
      setEditItemText(item.text);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditItemText('');
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
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          description: newText,
          author: newAuthor,
          dueDate: newDueDate,
          category: newCategory,
          priority: newPriority,
        }),
      });
      if (response.ok) {
        mutateChecklist(selectedPartId, draft => {
          const next = { ...draft };
          Object.keys(next).forEach(key => {
            next[key] = next[key].map(item =>
              item.id === itemId
                ? {
                    ...item,
                    text: newText,
                    description: newText,
                    author: newAuthor,
                    dueDate: newDueDate,
                    category: newCategory,
                    priority: newPriority,
                  }
                : item
            );
          });
          return next;
        });
        setEditingItemId(null);
        setEditItemText('');
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('체크리스트 항목을 정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/checklist/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        mutateChecklist(selectedPartId, draft => {
          const next: Record<string, ChecklistItem[]> = { ...draft };
          for (const opt in draft) {
            next[opt] = draft[opt].filter(item => item.id !== itemId);
          }
          return next;
        });
      }
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
    setEditingItemId(null);
  };

  const handleFileUpload = async (file: File, item: ChecklistItem) => {
    // 2단계: 첨부 전 checklist item 존재 여부 확인
    const stillExists = Object.values(checklistData)
      .flat()
      .some(i => i.id === item.id);
    if (!stillExists) {
      toast.error('이미 삭제된 항목입니다.');
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const reader = new FileReader();
    reader.onload = () => {
      const tempUri = reader.result as string;
      mutateChecklist(selectedPartId, draft => {
        const list = draft[item.optionType] ?? [];
        const target = list.find(i => i.id === item.id);
        if (target) {
          target.attachments = [
            ...(target.attachments ?? []),
            {
              id: tempId,
              checklistItemId: item.id,
              filename: file.name,
              mimeType: file.type,
              uri: tempUri,
              isTemp: true,
              url: '',
            },
          ];
        }
        return { ...draft };
      });
    };
    reader.readAsDataURL(file);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('checklistItemId', item.id.toString());
      const response = await fetch(`/api/attachments/${item.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      // 서버에서 최신 데이터 fetch
      fetch(`/api/checklist/${selectedPartId}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      })
        .then(res => res.json())
        .then(data => {
          setChecklistData(data);
        });
      toast.success('Upload successful');
    } catch (error) {
      console.error('Upload error:', error);
      mutateChecklist(selectedPartId, draft => {
        const list = draft[item.optionType] ?? [];
        const target = list.find(i => i.id === item.id);
        if (target && target.attachments) {
          target.attachments = target.attachments.filter(
            att => att.id !== tempId
          );
        }
        return { ...draft };
      });
      toast.error('Upload failed');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        credentials: 'include',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Delete failed');
      // 서버에서 최신 데이터 fetch
      fetch(`/api/checklist/${selectedPartId}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      })
        .then(res => res.json())
        .then(data => {
          setChecklistData(data);
        });
    } catch (error) {
      console.error('Delete attachment failed:', error);
      throw error;
    }
  };

  // 세션 체크 및 인증 리다이렉트
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // CSV 내보내기 함수
  function exportToCSV(sectionTitle: string, items: ChecklistItem[]) {
    const header = ['작업 이름', '담당자', '등록일자', '첨부파일 개수'];
    const rows = items.map(item => [
      '="' + (item.text || item.description || '').replace(/"/g, '""') + '"',
      '="' + (item.author || '') + '"',
      '="' + (item.dueDate ? item.dueDate.slice(0, 10) : '') + '"',
      '="' + (item.attachments ? item.attachments.length : 0) + '"',
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sectionTitle.replace(/\s+/g, '_')}_checklist.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 엑셀(xlsx) 내보내기 함수
  function exportToXLSX(sectionTitle: string, items: ChecklistItem[]) {
    const wsData = [
      ['작업 이름', '담당자', '등록일자', '첨부파일 개수'],
      ...items.map(item => [
        item.text || item.description || '',
        item.author || '',
        item.dueDate ? item.dueDate.slice(0, 10) : '',
        item.attachments ? item.attachments.length : 0,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // 컬럼 너비 자동 조정
    ws['!cols'] = [
      { wch: 40 }, // 작업 이름
      { wch: 16 }, // 담당자
      { wch: 16 }, // 등록일자
      { wch: 12 }, // 첨부파일 개수
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sectionTitle);
    XLSX.writeFile(wb, `${sectionTitle.replace(/\s+/g, '_')}_checklist.xlsx`);
  }

  const filteredTreeData = useTreeSearch(treeData, searchTerm);

  // 현재 섹션의 데이터 계산을 컴포넌트 최상위로 이동
  const currentSection = sections[currentSectionIndex];
  const sectionOpts = currentSection.options.filter(opt =>
    selectedOptions.includes(opt)
  );
  const allItems = sectionOpts
    .flatMap(opt => checklistData[opt] || [])
    .filter(item => item.section === currentSection.title);

  // Remove duplicate items by text, preserving last occurrence
  const uniqueItems = [
    ...new Map(
      allItems
        .filter(item => item.section === currentSection.title)
        .map(item => [item.text, item])
    ).values(),
  ];

  // 섹션별 필터 상태
  const filterValue = sectionFilters[currentSection.title] || '';
  const sortState = sectionSort[currentSection.title];
  const advFilter = sectionAdvancedFilters[currentSection.title] || {
    author: '',
    startDate: '',
    endDate: '',
    category: '',
    priority: '',
  };

  // 커스텀 훅을 사용한 필터링 (컴포넌트 최상위에서 호출)
  const filteredItems = useChecklistFilter(
    uniqueItems,
    {
      text: filterValue,
      author: advFilter.author,
      startDate: advFilter.startDate,
      endDate: advFilter.endDate,
      category: advFilter.category,
      priority: advFilter.priority,
    },
    {
      column: sortState?.column || null,
      order: sortState?.order || 'asc',
    }
  );

  // 섹션별 담당자 목록 추출
  const authors = Array.from(
    new Set(uniqueItems.map(item => item.author).filter(Boolean))
  );

  const { openNodes, setOpenNodes, openAssemblies, setOpenAssemblies } =
    useChecklistContext();

  const handleToggleNode = (nodeId: string) => {
    setOpenNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleToggleAssembly = (assemblyId: string) => {
    setOpenAssemblies(prev => ({
      ...prev,
      [assemblyId]: !prev[assemblyId],
    }));
  };

  return (
    <div className='flex min-h-screen'>
      {error && (
        <div className='fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center'>
          Error: {error}
        </div>
      )}
      {isLoading ? (
        <div className='flex items-center justify-center w-full'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900' />
        </div>
      ) : (
        <div className='flex flex-1'>
          <aside
            ref={sidebarRef}
            style={{ width: sidebarWidth }}
            className='bg-gray-100 p-4 overflow-auto'
          >
            <div className='flex justify-between items-center mb-2'>
              <h2 className='text-lg font-bold'>Simpac Press</h2>
              <button
                type='button'
                className='py-1 px-2 text-sm border rounded'
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? 'Done' : 'Edit'}
              </button>
            </div>
            <TreeView
              data={filteredTreeData}
              selectedPartId={selectedPartId}
              onSelectPart={handlePartSelect}
              openNodes={openNodes}
              onToggleNode={handleToggleNode}
              openAssemblies={openAssemblies}
              onToggleAssembly={handleToggleAssembly}
            />
            <div className='mt-6'>
              <h3 className='font-semibold mb-2'>Add New Assembly</h3>
              <input
                type='text'
                className='w-full mb-2 p-1 border rounded'
                placeholder='Assembly name'
                value={newAssemblyName}
                onChange={e => setNewAssemblyName(e.target.value)}
              />
              <button
                className='w-full bg-blue-500 text-white py-1 rounded'
                onClick={handleAddAssembly}
              >
                Add Assembly
              </button>
            </div>
            <div className='mt-6'>
              <h3 className='font-semibold mb-2'>Add New Part</h3>
              <select
                className='w-full mb-2 p-1 border rounded'
                value={selectedAssemblyId}
                onChange={e => setSelectedAssemblyId(e.target.value)}
              >
                <option value=''>Select Assembly</option>
                {treeData
                  .flatMap(n => n.assemblies)
                  .map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
              <input
                type='text'
                className='w-full mb-2 p-1 border rounded'
                placeholder='Part name'
                value={newPartName}
                onChange={e => setNewPartName(e.target.value)}
              />
              <button
                className='w-full bg-green-500 text-white py-1 rounded'
                onClick={handleAddPart}
              >
                Add Part
              </button>
            </div>
          </aside>
          {/* Resize handle */}
          <div
            onMouseDown={handleMouseDown}
            className='w-1 cursor-ew-resize bg-gray-300'
          />
          <main style={{ width: '70%' }} className='flex-1 p-4'>
            {/* Search bar placed inside main to prevent overlapping top options */}
            <div className='mb-4 px-2'>
              <input
                type='text'
                className='w-full p-2 border rounded'
                placeholder='Search assemblies or parts...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Section header and new item form */}
            <section
              onMouseDown={handleSectionDragStart}
              onMouseUp={handleSectionDragEnd}
              style={{ userSelect: 'none', overflow: 'hidden' }}
            >
              <div className='flex items-center justify-between mb-4'>
                <button
                  onClick={goToPrevSection}
                  disabled={currentSectionIndex === 0}
                  className='px-2 py-1 text-lg'
                >
                  ←
                </button>
                <h2 className='text-xl font-bold mb-2'>
                  {sections[currentSectionIndex].title} for{' '}
                  {selectedPart ? selectedPart.name : ''}
                </h2>
                <button
                  onClick={goToNextSection}
                  disabled={currentSectionIndex === sections.length - 1}
                  className='px-2 py-1 text-lg'
                >
                  →
                </button>
              </div>
              <div style={{ width: '100%', overflow: 'hidden' }}>
                {/* 한 번에 한 섹션만 렌더링 */}
                {(() => {
                  const sec = sections[currentSectionIndex];
                  return (
                    <div>
                      <ChecklistInputForm
                        selectedPart={selectedPart}
                        sections={sections}
                        selectedChecklistSection={selectedChecklistSection}
                        currentInput={currentInput}
                        options={options}
                        onSectionChange={setSelectedChecklistSection}
                        onInputChange={setCurrentInput}
                        onAddItem={() =>
                          handleAddChecklistWithSection(sec.title)
                        }
                      />
                      {/* Classification toggles (left) and checklist edit button (right) */}
                      <div className='flex justify-between items-center mb-4'>
                        <div className='flex space-x-2'>
                          <button
                            className={`px-3 py-1 border rounded ${allOptionsSelected ? 'bg-blue-500 text-white' : ''}`}
                            onClick={handleToggleAllOptions}
                          >
                            전체
                          </button>
                          {options.map(opt => {
                            const sel = selectedOptions.includes(opt);
                            return (
                              <button
                                key={opt}
                                className={`px-3 py-1 border rounded ${sel ? 'bg-blue-500 text-white' : ''}`}
                                onClick={() =>
                                  setSelectedOptions(prev =>
                                    prev.includes(opt)
                                      ? prev.filter(o => o !== opt)
                                      : [...prev, opt]
                                  )
                                }
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Sectored checklist displayed as columns: unique items per section */}
                      <div className='border-2 border-blue-300 p-4 rounded-lg bg-blue-50'>
                        <div className='flex justify-between items-center mb-2'>
                          <h3 className='text-lg font-semibold'>{sec.title}</h3>
                          <div className='flex gap-2'>
                            <button
                              className='px-3 py-1 bg-blue-600 text-white rounded text-sm'
                              onClick={() =>
                                exportToXLSX(sec.title, filteredItems)
                              }
                            >
                              엑셀로 내보내기
                            </button>
                          </div>
                        </div>
                        <ChecklistFilterBar
                          sectionTitle={sec.title}
                          filterValue={filterValue}
                          advFilter={advFilter}
                          authors={authors.filter(Boolean) as string[]}
                          onFilterChange={value =>
                            setSectionFilters(f => ({
                              ...f,
                              [sec.title]: value,
                            }))
                          }
                          onAdvancedFilterChange={filter =>
                            setSectionAdvancedFilters(f => ({
                              ...f,
                              [sec.title]: filter,
                            }))
                          }
                        />
                        <ChecklistTableContainer
                          sections={sections}
                          currentSectionIndex={currentSectionIndex}
                          checklistData={checklistData}
                          selectedOptions={selectedOptions}
                          sectionFilters={sectionFilters}
                          sectionSort={sectionSort}
                          onSort={handleSort}
                          onItemClick={setModalItem}
                          selectedPart={selectedPart}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>
            {/* Progress Dots (섹션 인디케이터) */}
            <div className='flex justify-center items-center mt-4 gap-2'>
              {sections.map((sec, idx) => (
                <button
                  key={sec.title}
                  onClick={() => setCurrentSectionIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${currentSectionIndex === idx ? 'bg-blue-600' : 'bg-gray-300'}`}
                  style={{ outline: 'none', border: 'none', padding: 0 }}
                  aria-label={`Go to ${sec.title}`}
                />
              ))}
            </div>
          </main>
        </div>
      )}
      {/* 상세/수정 모달 */}
      <ChecklistItemModal
        modalItem={modalItem}
        modalEditMode={modalEditMode}
        imagePreview={imagePreview}
        onClose={() => {
          setModalItem(null);
          setModalEditMode(false);
          setImagePreview(null);
        }}
        onEditModeToggle={() => setModalEditMode(!modalEditMode)}
        onSave={async () => {
          if (modalItem) {
            await handleEditChecklist(
              modalItem.id,
              modalItem.text || modalItem.description || '',
              modalItem.author,
              modalItem.dueDate,
              (modalItem as any).category,
              (modalItem as any).priority
            );
            setModalItem(null);
            setModalEditMode(false);
          }
        }}
        onDelete={async () => {
          if (modalItem) {
            await handleDeleteItem(modalItem.id);
            setModalItem(null);
            setModalEditMode(false);
          }
        }}
        onItemChange={setModalItem}
        onFileUpload={async file => {
          if (modalItem) {
            await handleFileUpload(file, modalItem);
          }
        }}
        onDeleteAttachment={async attachmentId => {
          await handleDeleteAttachment(attachmentId);
          if (modalItem) {
            setModalItem(m =>
              m
                ? {
                    ...m,
                    attachments: m.attachments?.filter(
                      a => a.id !== attachmentId
                    ),
                  }
                : m
            );
          }
        }}
        onImagePreview={url => setImagePreview(url)}
        onImagePreviewClose={() => setImagePreview(null)}
      />
    </div>
  );
}

export default function Home(props) {
  return (
    <ChecklistProvider>
      <PageContent {...props} />
    </ChecklistProvider>
  );
}
