'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ChecklistItem, AttachmentData } from '@/app/types/checklist';
import { PressNode, Part } from './TreeView';
import Sidebar from './Sidebar';
import MainChecklist from './MainChecklist';
import { useChecklistData } from '../../hooks/useChecklistData';
import { Model as ModelType } from '@/types/model';
import { getModelFromCookies } from '@/utils/cookieUtils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

interface CachedChecklist {
  data: Record<string, ChecklistItem[]>;
  fetchedAt: number;
}

export default function PageContainer() {
  const { data: session, status } = useSession();
  console.log('세션 정보:', session);
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<PressNode[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [models, setModels] = useState<ModelType[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedModelCode, setSelectedModelCode] = useState<string>('');
  const { checklistData, setChecklistData, mutateChecklist } = useChecklistData(
    selectedPartId,
    session,
    selectedModelCode // modelCode 전달
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [assemblyExpanded, setAssemblyExpanded] = useState<Record<string, boolean>>({});

  const isAdmin = typeof session?.user === 'object' && (
    (session.user as any).role === 'admin' || (session.user as any).isAdmin === true
  );

  const fetchTreeData = async (): Promise<PressNode[]> => {
    try {
      // modelCode가 있으면 쿼리 파라미터로 추가
      const url = selectedModelCode 
        ? `${API_BASE}/api/tree?modelId=${selectedModelCode}`
        : `${API_BASE}/api/tree`;
        
      const response = await fetch(url, {
        headers: {
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tree data');
      }
      const data = await response.json();
      console.log('Fetched tree data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching tree data:', error);
      throw error;
    }
  };

  const handleAddAssembly = async () => {
    if (!newAssemblyName.trim()) return;

    // 가장 첫 번째 press(루트) 노드 id 사용
    const pressNodeId = treeData[0]?.id;
    if (!pressNodeId) {
      toast.error('Press(루트) 노드가 없습니다.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/tree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({ 
          nodeId: pressNodeId, 
          name: newAssemblyName,
          modelId: selectedModelCode // 모델 코드로 변경
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add assembly');
      }

      const newTreeData = await fetchTreeData();
      setTreeData(newTreeData);
      setNewAssemblyName('');
      toast.success('Assembly added successfully');
    } catch (error) {
      console.error('Error adding assembly:', error);
      toast.error('Failed to add assembly');
    }
  };

  const handleAddPart = async () => {
    if (!selectedAssemblyId || !newPartName.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/tree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({
          assemblyId: selectedAssemblyId,
          name: newPartName,
          modelId: selectedModelCode // 모델 코드로 변경
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add part');
      }

      const newTreeData = await fetchTreeData();
      setTreeData(newTreeData);
      setNewPartName('');
      setSelectedAssemblyId('');
      toast.success('Part added successfully');
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  };

  const handlePartSelect = (part: Part) => {
    setSelectedPart(part);
    setSelectedPartId(part.id);
  };

  const handleEditPart = async (partId: string, newName: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/tree`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({ 
          partId, 
          name: newName,
          modelId: selectedModelCode // 모델 코드로 변경
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update part');
      }

      const newTreeData = await fetchTreeData();
      setTreeData(newTreeData);
      toast.success('Part updated successfully');
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    }
  };

  const handleEditAssembly = async (assemblyId: string, newName: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/tree`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({ 
          assemblyId, 
          name: newName,
          modelId: selectedModelCode // 모델 코드로 변경
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update assembly');
      }

      const newTreeData = await fetchTreeData();
      setTreeData(newTreeData);
      toast.success('Assembly updated successfully');
    } catch (error) {
      console.error('Error updating assembly:', error);
      toast.error('Failed to update assembly');
    }
  };

  const handleDeletePart = async (partId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/tree`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({ 
          partId,
          modelId: selectedModelCode // 모델 코드로 변경
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete part');
      }

      const newTreeData = await fetchTreeData();
      setTreeData(newTreeData);
      toast.success('Part deleted successfully');
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handleDelete = async (type: 'part' | 'assembly', id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/tree`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({ 
          type,
          id,
          modelId: selectedModelCode // 모델 코드로 변경
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}`);
      }

      const newTreeData = await fetchTreeData();
      setTreeData(newTreeData);
      toast.success(`${type} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleReorder = async (
    type: 'moveAssembly' | 'movePart',
    payload: any
  ) => {
    try {
      const response = await fetch(`${API_BASE}/api/tree`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({ 
          type, 
          ...payload,
          modelId: selectedModelCode // 모델 코드로 변경
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder');
      }

      const newTreeData = await fetchTreeData();
      setTreeData(newTreeData);
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder');
    }
  };

  const handleToggleNode = (nodeId: string) => {
    // This function can be implemented if needed
    console.log('Toggle node:', nodeId);
  };

  const handleToggleAssembly = (assemblyId: string) => {
    setAssemblyExpanded(prev => ({
      ...prev,
      [assemblyId]: !prev[assemblyId],
    }));
  };

  const handleFileUpload = async (file: File, item: ChecklistItem) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('checklistItemId', item.id);

      const response = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const attachment = await response.json();
      setAttachmentsCache(prev => ({
        ...prev,
        [item.id]: [...(prev[item.id] || []), attachment],
      }));

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete attachment');
      }

      setAttachmentsCache(prev => {
        const newCache = { ...prev };
        Object.keys(newCache).forEach(itemId => {
          newCache[itemId] = newCache[itemId].filter(
            att => att.id !== attachmentId
          );
        });
        return newCache;
      });

      toast.success('Attachment deleted successfully');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    }
  };

  // 선택한 기종 정보를 쿠키에서 읽어오기
  useEffect(() => {
    const modelInfo = getModelFromCookies();
    console.log('🔍 쿠키에서 읽어온 모델 정보:', modelInfo);
    if (modelInfo.id) {
      setSelectedModelId(modelInfo.id);
      setSelectedModelCode(modelInfo.code || '');
      console.log('✅ 선택된 기종 ID:', modelInfo.id);
      console.log('✅ 선택된 기종 코드:', modelInfo.code);
      console.log('✅ 선택된 기종 이름:', modelInfo.name);
    } else {
      console.log('⚠️ 쿠키에서 모델 ID를 찾을 수 없습니다');
    }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !selectedModelCode) return;
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔄 트리 데이터 로딩 시작 - 선택된 모델 코드:', selectedModelCode);
        const data = await fetchTreeData();
        console.log('📊 로드된 트리 데이터:', data);
        console.log('📊 트리 데이터 상세:', JSON.stringify(data, null, 2));
        setTreeData(data);
      } catch (error) {
        console.error('❌ 트리 데이터 로딩 실패:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [status, session, selectedModelCode]);

  useEffect(() => {
    // 모델 목록 불러오기
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setModels(data);
          if (data.length > 0 && !selectedModelId) {
            setSelectedModelId(String(data[0].id));
          }
        } else {
          setModels([]);
        }
      })
      .catch(err => {
        setModels([]);
        console.error('모델 목록 불러오기 실패:', err);
      });
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        treeData={treeData}
        selectedPart={selectedPart}
        selectedPartId={selectedPartId}
        onSelectPart={handlePartSelect}
        onAddAssembly={handleAddAssembly}
        onAddPart={handleAddPart}
        onEditPart={handleEditPart}
        onEditAssembly={handleEditAssembly}
        onDelete={handleDelete}
        onReorder={handleReorder}
        onToggleNode={handleToggleNode}
        onToggleAssembly={handleToggleAssembly}
        onSetAssemblyExpanded={setAssemblyExpanded}
        onSetNewPartName={setNewPartName}
        onSetSelectedAssemblyId={setSelectedAssemblyId}
        onSetNewAssemblyName={setNewAssemblyName}
        onSetSearchTerm={setSearchTerm}
        onSetIsEditMode={setIsEditMode}
        onSetSidebarWidth={setSidebarWidth}
        newPartName={newPartName}
        selectedAssemblyId={selectedAssemblyId}
        newAssemblyName={newAssemblyName}
        sidebarWidth={sidebarWidth}
        searchTerm={searchTerm}
        isEditMode={isEditMode}
        assemblyExpanded={assemblyExpanded}
        isAdmin={isAdmin}
      />
      <MainChecklist
        selectedPart={selectedPart}
        selectedPartId={selectedPartId}
        checklistData={checklistData}
        setChecklistData={setChecklistData}
        mutateChecklist={mutateChecklist}
        attachmentsCache={attachmentsCache}
        setAttachmentsCache={setAttachmentsCache}
        onFileUpload={handleFileUpload}
        onDeleteAttachment={handleDeleteAttachment}
        isAdmin={isAdmin}
      />
    </div>
  );
} 