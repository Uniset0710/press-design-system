"use client";
import React, { useEffect, useState, useRef } from "react";
import TreeView, { PressNode, Part } from "./components/TreeView";
import ChecklistItemComponent from "../components/ChecklistItemComponent";
import { v4 as uuid } from 'uuid';
import { ChecklistItem, AttachmentData } from '@/app/types/checklist';
import { toast } from 'react-hot-toast';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import CommentSection from './components/CommentSection';
import HistorySection from './components/HistorySection';

type TreeData = PressNode[];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

interface CachedChecklist {
  data: Record<string, ChecklistItem[]>;
  fetchedAt: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  console.log("useSession status:", status, session);
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TreeData>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [checklistData, setChecklistData] = useState<Record<string, ChecklistItem[]>>({
    DTL: [], DTE: [], DL: [], DE: [], '2P': [], '4P': []
  });
  const [checklistCache, setChecklistCache] = useState<Record<string, CachedChecklist>>({});
  const [attachmentsCache, setAttachmentsCache] = useState<Record<string, AttachmentData[]>>({});
  const [newPartName, setNewPartName] = useState<string>("");
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<string>("");
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [newAssemblyName, setNewAssemblyName] = useState<string>("");
  const [sidebarWidth, setSidebarWidth] = useState<number>(350);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isChecklistEditMode, setIsChecklistEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sections = [
    { title: 'Design Check List', options: ['DTL','DTE','DL','DE','2P','4P'] },
    { title: 'Machining Check List', options: ['DTL','DTE','DL','DE','2P','4P'] },
    { title: 'Assembly Check List', options: ['DTL','DTE','DL','DE','2P','4P'] },
  ];
  const [selectedChecklistSection, setSelectedChecklistSection] = useState<string>(sections[0].title);
  const [newChecklistText, setNewChecklistText] = useState<string>('');
  const [newChecklistOptions, setNewChecklistOptions] = useState<string[]>([]);

  // Top-level grouping options
  const options = ["DTL","DTE","DL","DE","2P","4P"];
  // Initialize selectedOptions with all to show all codes by default
  const [selectedOptions, setSelectedOptions] = useState<string[]>(options);

  // 섹션별 필터 상태 추가
  const [sectionFilters, setSectionFilters] = useState<Record<string, string>>({});

  // 새 체크리스트 항목 추가용 상태 추가
  const [newChecklistAuthor, setNewChecklistAuthor] = useState<string>("");
  const [newChecklistDueDate, setNewChecklistDueDate] = useState<string>("");

  // 섹션별 정렬 상태 추가
  const [sectionSort, setSectionSort] = useState<Record<string, { column: 'author' | 'dueDate' | 'category' | 'priority' | null, order: 'asc' | 'desc' }>>({});

  // 섹션별 필터 상태 추가 (기존 sectionFilters 외에 담당자/날짜/키워드)
  const [sectionAdvancedFilters, setSectionAdvancedFilters] = useState<Record<string, { author: string, startDate: string, endDate: string, category: string, priority: string }>>({});

  // 모달 상태: 상세/수정 모드 분리
  const [modalItem, setModalItem] = useState<ChecklistItem | null>(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 전체 선택/해제 핸들러
  const allSelected = options.every(opt => newChecklistOptions.includes(opt));
  const handleToggleAll = () => {
    setNewChecklistOptions(allSelected ? [] : options);
  };

  const allOptions = ["DTL","DTE","DL","DE","2P","4P"];
  const allOptionsSelected = allOptions.every(opt => selectedOptions.includes(opt));
  const handleToggleAllOptions = () => {
    setSelectedOptions(allOptionsSelected ? [] : allOptions);
  };

  // 섹션 인덱스 상태 추가
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const goToPrevSection = () => setCurrentSectionIndex(i => Math.max(0, i - 1));
  const goToNextSection = () => setCurrentSectionIndex(i => Math.min(sections.length - 1, i + 1));

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
  const [sectionInput, setSectionInput] = useState<Record<string, {
    text: string;
    author: string;
    dueDate: string;
    options: string[];
    category: string;
    priority: string;
  }>>(
    () => Object.fromEntries(sections.map(sec => [sec.title, { text: '', author: '', dueDate: '', options: [], category: '', priority: '' }]))
  );

  // 현재 섹션의 입력값을 쉽게 가져오기
  const currentSectionTitle = sections[currentSectionIndex].title;
  const currentInput = sectionInput[currentSectionTitle] || { text: '', author: '', dueDate: '', options: [], category: '', priority: '' };

  // 입력값 변경 핸들러
  const setCurrentInput = (patch: Partial<typeof currentInput>) => {
    setSectionInput(prev => ({
      ...prev,
      [currentSectionTitle]: { ...prev[currentSectionTitle], ...patch }
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
          'Authorization': `Bearer ${session?.accessToken}`
        }
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
    const filteredData = treeData.map(node => ({
      ...node,
      assemblies: node.assemblies
        .map(asm => ({
          ...asm,
          parts: asm.parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        }))
        .filter(asm => asm.name.toLowerCase().includes(searchTerm.toLowerCase()) || asm.parts.length > 0)
    }))
    .filter(node => node.name.toLowerCase().includes(searchTerm.toLowerCase()) || node.assemblies.length > 0);
    
    setTreeData(filteredData);
  }, [searchTerm]);

  function getCached(partId: string): CachedChecklist | null {
    const hit = checklistCache[partId];
    if (!hit) return null;
    if (Date.now() - hit.fetchedAt > 30_000) return null; // 30 seconds
    return hit;
  }

  function mutateChecklist(
    partId: string,
    mutator: (old: Record<string, ChecklistItem[]>) => Record<string, ChecklistItem[]>
  ) {
    setChecklistData(old => {
      const next = mutator(old);
      setChecklistCache(prev => ({
        ...prev,
        [partId]: { data: next, fetchedAt: Date.now() }
      }));
      return next;
    });
  }

  useEffect(() => {
    if (!selectedPartId || status !== 'authenticated') {
      setChecklistData({});
      return;
    }

    const hit = getCached(selectedPartId);
    if (hit) {
      setChecklistData(hit.data);
      return;
    }

    setChecklistData({});
    fetch(`/api/checklist/${selectedPartId}`, {
      headers: { Authorization: `Bearer ${session?.accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setChecklistData(data);
        setChecklistCache(prev => ({
          ...prev,
          [selectedPartId]: { data, fetchedAt: Date.now() }
        }));
      });
  }, [selectedPartId, status, session]);

  const handleAddPart = async () => {
    if (!selectedAssemblyId || !newPartName) return;
    await fetch(`/api/tree`, {
      credentials: 'include',
      method: 'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ assemblyId: selectedAssemblyId, name: newPartName }),
    });
    const updated = await fetchTreeData();
    setTreeData(updated);
    setNewPartName(''); setSelectedAssemblyId('');
  };

  const handlePartSelect = (part: Part) => {
    setSelectedPart(part);
    setSelectedPartId(part.id);
  };

  const handleEditPart = async (partId: string, newName: string) => {
    const resp = await fetch(`/api/tree`, {
      credentials: 'include',
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ partId, name:newName }) });
    if (resp.ok) setTreeData(await fetchTreeData());
  };

  const handleEditAssembly = async (assemblyId: string, newName: string) => {
    const resp = await fetch(`/api/tree`, {
      credentials: 'include',
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ assemblyId, name:newName }) });
    if (resp.ok) setTreeData(await fetchTreeData());
  };

  const handleDelete = async (type:'part'|'assembly', id:string) => {
    // Confirm deletion
    const itemType = type === 'assembly' ? '어셈블리' : '파트';
    if (!window.confirm(`${itemType}을(를) 정말 삭제하시겠습니까?`)) return;
    const resp = await fetch(`/api/tree`, {
      credentials: 'include',
      method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type, id }) });
    if (resp.ok) setTreeData(await fetchTreeData());
  };

  const handleReorder = async (type:'moveAssembly'|'movePart', payload:any) => {
    const resp = await fetch(`/api/tree`, {
      credentials: 'include',
      method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type, ...payload }) });
    if (resp.ok) setTreeData(await fetchTreeData());
  };

  const handleAddAssembly = async () => {
    if (!newAssemblyName || treeData.length === 0) return;
    const rootNodeId = treeData[0].id;
    await fetch(`/api/tree`, {
      credentials: 'include',
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId: rootNodeId, name: newAssemblyName }),
    });
    const updated = await fetchTreeData();
    setTreeData(updated);
    setNewAssemblyName('');
  };

  // Mouse-down handler to start resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = sidebarRef.current?.getBoundingClientRect().width ?? sidebarWidth;
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
    if (!selectedPart || !sectionInput[sectionTitle].text || sectionInput[sectionTitle].options.length === 0) return;
    for (const optionType of sectionInput[sectionTitle].options) {
      try {
        fetch(`/api/checklist/${selectedPartId}`, {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.accessToken}` },
          body: JSON.stringify({
            optionType,
            description: sectionInput[sectionTitle].text,
            section: sectionTitle,
            author: sectionInput[sectionTitle].author,
            dueDate: sectionInput[sectionTitle].dueDate,
            category: sectionInput[sectionTitle].category,
            priority: sectionInput[sectionTitle].priority
          })
        }).then(async response => {
          if (response.ok) {
            const newItem = await response.json();
            setChecklistData(prev => {
              const next = { ...prev };
              next[optionType] = [...(next[optionType] ?? []), { ...newItem, attachments: [] }];
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
      [sectionTitle]: { ...prev[sectionTitle], text: '', author: '', dueDate: '', options: [], category: '', priority: '' }
    }));
  };

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemText, setEditItemText] = useState<string>("");

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
    setEditItemText("");
  };

  const handleEditChecklist = async (itemId: string, newText: string, newAuthor?: string, newDueDate?: string, newCategory?: string, newPriority?: string): Promise<void> => {
    try {
      const response = await fetch(`/api/checklist/${itemId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ description: newText, author: newAuthor, dueDate: newDueDate, category: newCategory, priority: newPriority })
      });
      if (response.ok) {
        mutateChecklist(selectedPartId, draft => {
          const next = { ...draft };
          Object.keys(next).forEach(key => {
            next[key] = next[key].map(item => 
              item.id === itemId ? { ...item, text: newText, description: newText, author: newAuthor, dueDate: newDueDate, category: newCategory, priority: newPriority } : item
            );
          });
          return next;
        });
        setEditingItemId(null);
        setEditItemText("");
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
          'Authorization': `Bearer ${session?.accessToken}`
        }
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
    const stillExists = Object.values(checklistData).flat().some(i => i.id === item.id);
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
              url: ''
            }
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
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: formData
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      // 첨부 성공 시 캐시 무효화
      setChecklistCache(prev => {
        const next = { ...prev };
        delete next[selectedPartId];
        return next;
      });
      // 서버에서 최신 데이터 fetch
      fetch(`/api/checklist/${selectedPartId}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      })
        .then(res => res.json())
        .then(data => {
          setChecklistData(data);
          setChecklistCache(prev => ({
            ...prev,
            [selectedPartId]: { data, fetchedAt: Date.now() }
          }));
        });
      toast.success('Upload successful');
    } catch (error) {
      console.error('Upload error:', error);
      mutateChecklist(selectedPartId, draft => {
        const list = draft[item.optionType] ?? [];
        const target = list.find(i => i.id === item.id);
        if (target && target.attachments) {
          target.attachments = target.attachments.filter(att => att.id !== tempId);
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
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      if (!res.ok) throw new Error('Delete failed');
      // 삭제 성공 시 캐시 무효화
      setChecklistCache(prev => {
        const next = { ...prev };
        delete next[selectedPartId];
        return next;
      });
      // 서버에서 최신 데이터 fetch
      fetch(`/api/checklist/${selectedPartId}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      })
        .then(res => res.json())
        .then(data => {
          setChecklistData(data);
          setChecklistCache(prev => ({
            ...prev,
            [selectedPartId]: { data, fetchedAt: Date.now() }
          }));
        });
    } catch (error) {
      console.error('Delete attachment failed:', error);
      throw error;
    }
  };

  // 세션 체크 및 인증 리다이렉트
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // CSV 내보내기 함수
  function exportToCSV(sectionTitle: string, items: ChecklistItem[]) {
    const header = ['작업 이름', '담당자', '등록일자', '첨부파일 개수'];
    const rows = items.map(item => [
      '="' + (item.text || item.description || '').replace(/"/g, '""') + '"',
      '="' + (item.author || '') + '"',
      '="' + (item.dueDate ? item.dueDate.slice(0, 10) : '') + '"',
      '="' + (item.attachments ? item.attachments.length : 0) + '"'
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
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
        item.attachments ? item.attachments.length : 0
      ])
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

  return (
    <div className="flex min-h-screen">
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center">
          Error: {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="flex flex-1">
          <aside
            ref={sidebarRef}
            style={{ width: sidebarWidth }}
            className="bg-gray-100 p-4 overflow-auto"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Simpac Press</h2>
              <button
                type="button"
                className="py-1 px-2 text-sm border rounded"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? 'Done' : 'Edit'}
              </button>
            </div>
            <TreeView
              data={
                treeData
                  .map(node => ({
                    ...node,
                    assemblies: node.assemblies
                      .map(asm => ({
                        ...asm,
                        parts: asm.parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      }))
                      .filter(asm => asm.name.toLowerCase().includes(searchTerm.toLowerCase()) || asm.parts.length > 0)
                  }))
                  .filter(node => node.name.toLowerCase().includes(searchTerm.toLowerCase()) || node.assemblies.length > 0)
              }
              selectedPartId={selectedPartId}
              editMode={isEditMode}
              onSelectPart={handlePartSelect}
              onEditPart={handleEditPart}
              onEditAssembly={handleEditAssembly}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Add New Assembly</h3>
              <input
                type="text"
                className="w-full mb-2 p-1 border rounded"
                placeholder="Assembly name"
                value={newAssemblyName}
                onChange={(e) => setNewAssemblyName(e.target.value)}
              />
              <button
                className="w-full bg-blue-500 text-white py-1 rounded"
                onClick={handleAddAssembly}
              >
                Add Assembly
              </button>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Add New Part</h3>
              <select className="w-full mb-2 p-1 border rounded" value={selectedAssemblyId} onChange={e=>setSelectedAssemblyId(e.target.value)}>
                <option value="">Select Assembly</option>
                {treeData.flatMap(n=>n.assemblies).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input type="text" className="w-full mb-2 p-1 border rounded" placeholder="Part name" value={newPartName} onChange={e=>setNewPartName(e.target.value)} />
              <button className="w-full bg-green-500 text-white py-1 rounded" onClick={handleAddPart}>Add Part</button>
            </div>
          </aside>
          {/* Resize handle */}
          <div onMouseDown={handleMouseDown} className="w-1 cursor-ew-resize bg-gray-300" />
          <main style={{ width: '70%' }} className="flex-1 p-4">
            {/* Search bar placed inside main to prevent overlapping top options */}
            <div className="mb-4 px-2">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Search assemblies or parts..."
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
              <div className="flex items-center justify-between mb-4">
                <button onClick={goToPrevSection} disabled={currentSectionIndex === 0} className="px-2 py-1 text-lg">←</button>
                <h2 className="text-xl font-bold mb-2">{sections[currentSectionIndex].title} for {selectedPart ? selectedPart.name : ''}</h2>
                <button onClick={goToNextSection} disabled={currentSectionIndex === sections.length - 1} className="px-2 py-1 text-lg">→</button>
              </div>
              <div style={{ width: '100%', overflow: 'hidden' }}>
                {/* 한 번에 한 섹션만 렌더링 */}
                {(() => {
                  const sec = sections[currentSectionIndex];
                  // aggregate attached items only for classification codes belonging to this section
                  const sectionOpts = sec.options.filter(opt => selectedOptions.includes(opt));
                  const allItems = sectionOpts
                    .flatMap(opt => checklistData[opt] || [])
                    .filter(item => item.section === sec.title);
                  // Remove duplicate items by text, preserving last occurrence
                  let uniqueItems = [...new Map(
                    allItems
                      .filter(item => item.section === sec.title)
                      .map(item => [item.text, item])
                  ).values()];
                  // 섹션별 필터 적용
                  const filterValue = sectionFilters[sec.title] || "";
                  if (filterValue) {
                    uniqueItems = uniqueItems.filter(item =>
                      item.text.toLowerCase().includes(filterValue.toLowerCase()) ||
                      (item.description && item.description.toLowerCase().includes(filterValue.toLowerCase()))
                    );
                  }
                  // 섹션별 정렬 적용
                  const sortState = sectionSort[sec.title];
                  let sortedItems = [...uniqueItems];
                  if (sortState && sortState.column) {
                    const col = sortState.column;
                    if (col && col !== 'dueDate') {
                      sortedItems.sort((a, b) => {
                        const va = ((a as any)[col] ?? '').toString().toLowerCase();
                        const vb = ((b as any)[col] ?? '').toString().toLowerCase();
                        if (va < vb) return sortState.order === 'asc' ? -1 : 1;
                        if (va > vb) return sortState.order === 'asc' ? 1 : -1;
                        return 0;
                      });
                    } else if (col === 'dueDate') {
                      sortedItems.sort((a, b) => {
                        const va = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                        const vb = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                        if (va < vb) return sortState.order === 'asc' ? -1 : 1;
                        if (va > vb) return sortState.order === 'asc' ? 1 : -1;
                        return 0;
                      });
                    }
                  }
                  // 섹션별 고급 필터 상태
                  const advFilter = sectionAdvancedFilters[sec.title] || { author: '', startDate: '', endDate: '', category: '', priority: '' };
                  // 섹션별 담당자 목록 추출
                  const authors = Array.from(new Set(uniqueItems.map(item => item.author).filter(Boolean)));
                  // 필터 적용
                  let filteredItems = uniqueItems.filter(item => {
                    let ok = true;
                    if (advFilter.author) ok = ok && (item.author || '') === advFilter.author;
                    if (advFilter.startDate) ok = ok && (item.dueDate ? item.dueDate.slice(0, 10) >= advFilter.startDate : false);
                    if (advFilter.endDate) ok = ok && (item.dueDate ? item.dueDate.slice(0, 10) <= advFilter.endDate : false);
                    if (advFilter.category) ok = ok && ((item as any).category || '') === advFilter.category;
                    if (advFilter.priority) ok = ok && ((item as any).priority || '') === advFilter.priority;
                    return ok;
                  });
                  return (
                    <div>
                      {selectedPart && (
                        <div className="mb-6 p-4 bg-white rounded shadow" style={{ maxWidth: 900, marginRight: 'auto', marginLeft: 0 }}>
                          {/* Section selector */}
                          <label className="block font-medium mb-1">Section:</label>
                          <select
                            className="w-full mb-2 p-1 border rounded"
                            value={selectedChecklistSection}
                            onChange={e => setSelectedChecklistSection(e.target.value)}
                          >
                            {sections.map(sec2 => (
                              <option key={sec2.title} value={sec2.title}>{sec2.title}</option>
                            ))}
                          </select>
                          <label className="block font-medium mb-1">Item text</label>
                          <textarea
                            className="w-full mb-2 p-1 border rounded"
                            placeholder="Item text"
                            value={currentInput.text}
                            onChange={e => setCurrentInput({ text: e.target.value })}
                            rows={5}
                          />
                          {/* 담당자/마감일 입력란 추가 */}
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              className="flex-1 p-1 border rounded"
                              placeholder="담당자"
                              value={currentInput.author}
                              onChange={e => setCurrentInput({ author: e.target.value })}
                            />
                            <input
                              type="date"
                              className="flex-1 p-1 border rounded"
                              placeholder="마감일"
                              value={currentInput.dueDate}
                              onChange={e => setCurrentInput({ dueDate: e.target.value })}
                            />
                          </div>
                          {/* 분류, 중요도 드롭다운 추가 */}
                          <div className="flex gap-2 mb-2">
                            <select
                              className="flex-1 p-1 border rounded"
                              value={currentInput.category}
                              onChange={e => setCurrentInput({ category: e.target.value })}
                            >
                              <option value="">분류 선택</option>
                              <option value="용접">용접</option>
                              <option value="가공">가공</option>
                              <option value="조립">조립</option>
                            </select>
                            <select
                              className="flex-1 p-1 border rounded"
                              value={currentInput.priority}
                              onChange={e => setCurrentInput({ priority: e.target.value })}
                            >
                              <option value="">중요도 선택</option>
                              <option value="최상">최상</option>
                              <option value="상">상</option>
                              <option value="중">중</option>
                              <option value="하">하</option>
                              <option value="최하">최하</option>
                            </select>
                          </div>
                          {/* Always show all top-level options for classification */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={currentInput.options.length === options.length}
                                onChange={() => setCurrentInput({ options: currentInput.options.length === options.length ? [] : options })}
                              />
                              전체
                            </label>
                            {options.map(opt => (
                              <label key={opt} className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={currentInput.options.includes(opt)}
                                  onChange={() => setCurrentInput({ options: currentInput.options.includes(opt) ? currentInput.options.filter(o => o!==opt) : [...currentInput.options, opt] })}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                          <button className="bg-blue-500 text-white py-1 px-3 rounded" onClick={() => handleAddChecklistWithSection(sec.title)}>
                            Add Item
                          </button>
                        </div>
                      )}
                      {/* Classification toggles (left) and checklist edit button (right) */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-2">
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
                                onClick={() => setSelectedOptions(prev =>
                                  prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
                                )}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Sectored checklist displayed as columns: unique items per section */}
                      <div className="border-2 border-blue-300 p-4 rounded-lg bg-blue-50">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">{sec.title}</h3>
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                              onClick={() => exportToXLSX(sec.title, sortedItems.filter(item => filteredItems.includes(item)))}
                            >
                              엑셀로 내보내기
                            </button>
                          </div>
                        </div>
                        {/* 섹션별 인라인 검색창 + X버튼 */}
                        <div className="relative mb-2 flex gap-2 items-center">
                          <input
                            type="text"
                            className="p-1 border rounded w-full pr-8 h-8 min-w-[120px]"
                            placeholder={`Search in ${sec.title}`}
                            value={filterValue}
                            onChange={e => setSectionFilters(f => ({ ...f, [sec.title]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === "Escape") {
                                setSectionFilters(f => ({ ...f, [sec.title]: "" }));
                              }
                            }}
                          />
                          {filterValue && (
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg"
                              onClick={() => setSectionFilters(f => ({ ...f, [sec.title]: "" }))}
                              aria-label="Clear search"
                            >
                              ×
                            </button>
                          )}
                          {/* 담당자 드롭다운 */}
                          <select
                            className="p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
                            value={advFilter.author}
                            onChange={e => setSectionAdvancedFilters(f => ({ ...f, [sec.title]: { ...advFilter, author: e.target.value } }))}
                          >
                            <option value="">담당자</option>
                            {authors.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          {/* 등록일자 기간(시작~종료) */}
                          <input
                            type="date"
                            className="p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
                            value={advFilter.startDate || ''}
                            onChange={e => setSectionAdvancedFilters(f => ({ ...f, [sec.title]: { ...advFilter, startDate: e.target.value } }))}
                            placeholder="시작일"
                          />
                          <span className="mx-1">~</span>
                          <input
                            type="date"
                            className="p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
                            value={advFilter.endDate || ''}
                            onChange={e => setSectionAdvancedFilters(f => ({ ...f, [sec.title]: { ...advFilter, endDate: e.target.value } }))}
                            placeholder="종료일"
                          />
                          {/* 분류 필터 */}
                          <select
                            className="p-1 border rounded h-8 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
                            value={advFilter.category || ''}
                            onChange={e => setSectionAdvancedFilters(f => ({ ...f, [sec.title]: { ...advFilter, category: e.target.value } }))}
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
                            onChange={e => setSectionAdvancedFilters(f => ({ ...f, [sec.title]: { ...advFilter, priority: e.target.value } }))}
                          >
                            <option value="">중요도</option>
                            <option value="최상">최상</option>
                            <option value="상">상</option>
                            <option value="중">중</option>
                            <option value="하">하</option>
                            <option value="최하">최하</option>
                          </select>
                        </div>
                        {filteredItems.length > 0 ? (
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-blue-100">
                                <th className="border px-2 py-1 min-w-[60px] sm:min-w-[80px] md:min-w-[100px]">작업 이름</th>
                                <th
                                  className="border px-2 py-1 whitespace-nowrap min-w-[60px] sm:min-w-[80px] md:min-w-[100px] text-center cursor-pointer select-none"
                                  onClick={() => setSectionSort(s => {
                                    const prev = s[sec.title];
                                    let nextOrder: 'asc' | 'desc' = 'asc';
                                    if (prev?.column === 'author') nextOrder = prev.order === 'asc' ? 'desc' : 'asc';
                                    return { ...s, [sec.title]: { column: 'author', order: nextOrder } };
                                  })}
                                >
                                  담당자
                                  {sortState?.column === 'author' && (sortState.order === 'asc' ? ' ▲' : ' ▼')}
                                </th>
                                <th
                                  className="border px-2 py-1 whitespace-nowrap min-w-[80px] sm:min-w-[100px] md:min-w-[120px] text-center cursor-pointer select-none"
                                  onClick={() => setSectionSort(s => {
                                    const prev = s[sec.title];
                                    let nextOrder: 'asc' | 'desc' = 'asc';
                                    if (prev?.column === 'dueDate') nextOrder = prev.order === 'asc' ? 'desc' : 'asc';
                                    return { ...s, [sec.title]: { column: 'dueDate', order: nextOrder } };
                                  })}
                                >
                                  등록일자
                                  {sortState?.column === 'dueDate' && (sortState.order === 'asc' ? ' ▲' : ' ▼')}
                                </th>
                                <th
                                  className="border px-2 py-1 whitespace-nowrap min-w-[50px] sm:min-w-[60px] md:min-w-[80px] text-center cursor-pointer select-none"
                                  onClick={() => setSectionSort(s => {
                                    const prev = s[sec.title];
                                    let nextOrder: 'asc' | 'desc' = 'asc';
                                    if (prev?.column === 'category') nextOrder = prev.order === 'asc' ? 'desc' : 'asc';
                                    return { ...s, [sec.title]: { column: 'category', order: nextOrder } };
                                  })}
                                >
                                  분류
                                  {sortState?.column === 'category' && (sortState.order === 'asc' ? ' ▲' : ' ▼')}
                                </th>
                                <th
                                  className="border px-2 py-1 whitespace-nowrap min-w-[50px] sm:min-w-[60px] md:min-w-[80px] text-center cursor-pointer select-none"
                                  onClick={() => setSectionSort(s => {
                                    const prev = s[sec.title];
                                    let nextOrder: 'asc' | 'desc' = 'asc';
                                    if (prev?.column === 'priority') nextOrder = prev.order === 'asc' ? 'desc' : 'asc';
                                    return { ...s, [sec.title]: { column: 'priority', order: nextOrder } };
                                  })}
                                >
                                  중요도
                                  {sortState?.column === 'priority' && (sortState.order === 'asc' ? ' ▲' : ' ▼')}
                                </th>
                                <th className="border px-2 py-1 whitespace-nowrap min-w-[40px] sm:min-w-[60px] md:min-w-[80px] text-center">첨부</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedItems.filter(item => filteredItems.includes(item)).map(item => (
                                <tr key={item.id} className="bg-white cursor-pointer hover:bg-blue-50" onClick={() => setModalItem(item)}>
                                  <td className="border px-2 py-1">{item.text || item.description}</td>
                                  <td className="border px-2 py-1 whitespace-nowrap text-center">{item.author || '-'}</td>
                                  <td className="border px-2 py-1 whitespace-nowrap text-center">{item.dueDate ? item.dueDate.slice(0, 10) : '-'}</td>
                                  <td className="border px-2 py-1 whitespace-nowrap text-center">{(item as any).category || '-'}</td>
                                  <td className="border px-2 py-1 whitespace-nowrap text-center">{(item as any).priority || '-'}</td>
                                  <td className="border px-2 py-1 whitespace-nowrap text-center">
                                    {item.attachments && item.attachments.length > 0 ? (
                                      <span title="첨부파일 있음">📎 {item.attachments.length}</span>
                                    ) : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="ml-4">{isChecklistEditMode ? 'No items found.' : 'No items.'}</div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>
            {/* Progress Dots (섹션 인디케이터) */}
            <div className="flex justify-center items-center mt-4 gap-2">
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
      {modalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => { setModalItem(null); setModalEditMode(false); setImagePreview(null); }}>
          <div className="bg-white rounded shadow-lg p-6 min-w-[600px] max-w-[98vw] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{modalEditMode ? '수정' : '상세 정보'}</h2>
            {/* 작업이름 */}
            <div className="mb-2">
              <label className="block text-xs font-semibold mb-1">작업 이름</label>
              {modalEditMode ? (
                <textarea className="border rounded p-1 w-full min-h-[60px]" value={modalItem.text || modalItem.description || ''} onChange={e => setModalItem({ ...modalItem, text: e.target.value, description: e.target.value })} />
              ) : (
                <div className="p-2 bg-gray-50 rounded min-h-[40px]">{modalItem.text || modalItem.description}</div>
              )}
            </div>
            {/* 담당자 */}
            <div className="mb-2">
              <label className="block text-xs font-semibold mb-1">담당자</label>
              {modalEditMode ? (
                <input type="text" className="border rounded p-1 w-full" value={modalItem.author || ''} onChange={e => setModalItem({ ...modalItem, author: e.target.value })} />
              ) : (
                <div className="p-2 bg-gray-50 rounded min-h-[32px]">{modalItem.author || '-'}</div>
              )}
            </div>
            {/* 등록일자 */}
            <div className="mb-2">
              <label className="block text-xs font-semibold mb-1">등록일자</label>
              {modalEditMode ? (
                <input type="date" className="border rounded p-1 w-full" value={modalItem.dueDate ? modalItem.dueDate.slice(0, 10) : ''} onChange={e => setModalItem({ ...modalItem, dueDate: e.target.value })} />
              ) : (
                <div className="p-2 bg-gray-50 rounded min-h-[32px]">{modalItem.dueDate ? modalItem.dueDate.slice(0, 10) : '-'}</div>
              )}
            </div>
            {/* 분류 */}
            <div className="mb-2">
              <label className="block text-xs font-semibold mb-1">분류</label>
              {modalEditMode ? (
                <select
                  className="border rounded p-1 w-full"
                  value={(modalItem as any).category || ''}
                  onChange={e => setModalItem(m => m ? { ...m, category: e.target.value } : m)}
                >
                  <option value="">분류 선택</option>
                  <option value="용접">용접</option>
                  <option value="가공">가공</option>
                  <option value="조립">조립</option>
                </select>
              ) : (
                <div className="p-2 bg-gray-50 rounded min-h-[32px]">{(modalItem as any).category || '-'}</div>
              )}
            </div>
            {/* 중요도 */}
            <div className="mb-2">
              <label className="block text-xs font-semibold mb-1">중요도</label>
              {modalEditMode ? (
                <select
                  className="border rounded p-1 w-full"
                  value={(modalItem as any).priority || ''}
                  onChange={e => setModalItem(m => m ? { ...m, priority: e.target.value } : m)}
                >
                  <option value="">중요도 선택</option>
                  <option value="최상">최상</option>
                  <option value="상">상</option>
                  <option value="중">중</option>
                  <option value="하">하</option>
                  <option value="최하">최하</option>
                </select>
              ) : (
                <div className="p-2 bg-gray-50 rounded min-h-[32px]">{(modalItem as any).priority || '-'}</div>
              )}
            </div>
            {/* 첨부파일 */}
            <div className="mb-2">
              <label className="block text-xs font-semibold mb-1">첨부파일</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {modalItem.attachments && modalItem.attachments.length > 0 ? (
                  modalItem.attachments.map(att => {
                    const isImage = att.mimeType?.startsWith('image/');
                    return (
                      <div key={att.id} className="flex items-center gap-1 border rounded px-2 py-1 bg-gray-50">
                        {isImage ? (
                          <img src={att.url || att.uri} alt={att.filename} className="w-10 h-10 object-cover rounded cursor-pointer" onClick={() => setImagePreview(att.url || att.uri || '')} />
                        ) : (
                          <a href={att.url || att.uri} target="_blank" rel="noopener noreferrer" className="underline text-blue-600" download={att.filename}>{att.filename}</a>
                        )}
                        {modalEditMode && (
                          <button className="text-red-500 ml-1" title="삭제" onClick={async () => { await handleDeleteAttachment(att.id); setModalItem(m => m ? { ...m, attachments: m.attachments?.filter(a => a.id !== att.id) } : m); }}>×</button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <span className="text-gray-400">첨부 없음</span>
                )}
              </div>
              {modalEditMode && (
                <input type="file" onChange={async e => { if (e.target.files && e.target.files[0]) { await handleFileUpload(e.target.files[0], modalItem); } }} />
              )}
            </div>

            {/* 코멘트 섹션 추가 */}
            <CommentSection itemId={modalItem.id.toString()} />
            
            {/* 히스토리 섹션 추가 */}
            <HistorySection entityType="checklist" entityId={modalItem.id.toString()} />

            {/* 이미지 미리보기 모달 */}
            {imagePreview && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setImagePreview(null)}>
                <img src={imagePreview} alt="미리보기" className="max-w-3xl max-h-[90vh] rounded shadow-lg" />
              </div>
            )}
            <div className="flex gap-2 mt-4">
              {modalEditMode ? (
                <>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={async () => { await handleEditChecklist(modalItem.id, modalItem.text || modalItem.description || '', modalItem.author, modalItem.dueDate, (modalItem as any).category, (modalItem as any).priority); setModalItem(null); setModalEditMode(false); }}>저장</button>
                  <button className="px-3 py-1 bg-gray-300 text-black rounded" onClick={() => setModalEditMode(false)}>취소</button>
                </>
              ) : (
                <>
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded" onClick={() => setModalEditMode(true)}>수정</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={async () => { await handleDeleteItem(modalItem.id); setModalItem(null); setModalEditMode(false); }}>삭제</button>
                  <button className="px-3 py-1 bg-gray-300 text-black rounded" onClick={() => { setModalItem(null); setModalEditMode(false); }}>닫기</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
