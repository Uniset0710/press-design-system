'use client';
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * 부품 정보를 담는 인터페이스
 */
export interface Part {
  /** 부품 고유 ID */
  id: string;
  /** 부품 이름 */
  name: string;
}

/**
 * 조립체 정보를 담는 인터페이스
 */
export interface Assembly {
  /** 조립체 고유 ID */
  id: string;
  /** 조립체 이름 */
  name: string;
  /** 포함된 부품들 */
  parts: Part[];
}

/**
 * 프레스 노드 정보를 담는 인터페이스
 */
export interface PressNode {
  /** 프레스 고유 ID */
  id: string;
  /** 프레스 이름 */
  name: string;
  /** 포함된 조립체들 */
  assemblies: Assembly[];
}

/**
 * 트리 구조의 데이터를 표시하는 컴포넌트
 *
 * @description
 * - 프레스 > 조립체 > 부품의 계층 구조를 트리 형태로 표시합니다
 * - 각 레벨을 확장/축소할 수 있습니다
 * - 부품 선택 시 하이라이트 표시됩니다
 * - 드래그 앤 드롭으로 순서 변경 가능합니다
 * - 편집/삭제 기능을 제공합니다
 * - 반응형 디자인으로 모바일에서도 사용 가능합니다
 *
 * @example
 * ```tsx
 * <TreeView
 *   data={pressData}
 *   onSelectPart={handlePartSelect}
 *   selectedPartId={selectedPart?.id}
 *   onEditPart={handleEditPart}
 *   onEditAssembly={handleEditAssembly}
 *   onDelete={handleDelete}
 *   onReorder={handleReorder}
 *   editMode={isEditMode}
 * />
 * ```
 */
interface TreeViewProps {
  /** 표시할 트리 데이터 */
  data: PressNode[];
  /** 부품 선택 이벤트 핸들러 */
  onSelectPart: (part: Part) => void;
  /** 현재 선택된 부품 ID (선택사항) */
  selectedPartId?: string;
  /** 부품 편집 이벤트 핸들러 */
  onEditPart?: (partId: string, newName: string) => void;
  /** 조립체 편집 이벤트 핸들러 */
  onEditAssembly?: (assemblyId: string, newName: string) => void;
  /** 삭제 이벤트 핸들러 */
  onDelete?: (type: 'part' | 'assembly', id: string) => void;
  /** 순서 변경 이벤트 핸들러 */
  onReorder?: (
    type: 'moveAssembly' | 'movePart',
    payload: {
      nodeId: string;
      assemblyId?: string;
      fromIndex: number;
      toIndex: number;
    }
  ) => void;
  /** 편집 모드 여부 */
  editMode?: boolean;
}

function ChevronRight() {
  return (
    <svg
      width='18'
      height='18'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      className='inline-block align-middle'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 5l7 7-7 7'
      />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg
      width='18'
      height='18'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      className='inline-block align-middle'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M19 9l-7 7-7-7'
      />
    </svg>
  );
}

export default function TreeView({
  data,
  onSelectPart,
  selectedPartId,
  onEditPart,
  onEditAssembly,
  onDelete,
  onReorder,
  editMode = false,
}: TreeViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!onReorder) return;
    
    const { active, over } = event;
    if (!over) return;
    const fromId = active.data.current?.sortable.containerId;
    const toId = over.data.current?.sortable.containerId;
    if (!fromId || fromId !== toId) return;

    if (fromId.startsWith('assemblies-')) {
      const nodeId = fromId.replace('assemblies-', '');
      const node = data.find(n => n.id === nodeId);
      if (!node) return;
      const fromIndex = node.assemblies.findIndex(a => a.id === active.id);
      const toIndex = node.assemblies.findIndex(a => a.id === over.id);
      onReorder('moveAssembly', { nodeId, fromIndex, toIndex });
    } else if (fromId.startsWith('parts-')) {
      const assemblyId = fromId.replace('parts-', '');
      const node = data.find(n => n.assemblies.some(a => a.id === assemblyId));
      if (!node) return;
      const asm = node.assemblies.find(a => a.id === assemblyId)!;
      const fromIndex = asm.parts.findIndex(p => p.id === active.id);
      const toIndex = asm.parts.findIndex(p => p.id === over.id);
      onReorder('movePart', {
        nodeId: node.id,
        assemblyId,
        fromIndex,
        toIndex,
      });
    }
  };

  // Sortable assembly component
  const SortableAssembly: React.FC<{
    nodeId: string;
    assembly: Assembly;
  }> = ({ nodeId, assembly }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(assembly.name);
    const [isExpanded, setIsExpanded] = useState(false);
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: assembly.id,
      data: { sortable: { containerId: `assemblies-${nodeId}` } },
    });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <li ref={setNodeRef} style={style} className='list-none mb-2'>
        <div className='group flex items-center'>
          {/* drag handle */}
          {editMode && onReorder && (
            <span
              {...attributes}
              {...listeners}
              className='cursor-move mr-2 select-none text-gray-400 hover:text-gray-600'
            >
              ≡
            </span>
          )}
          <div className='flex-1'>
            {isEditing ? (
              <div
                className='flex items-center gap-2 p-2 bg-white rounded shadow border'
                onClick={e => e.stopPropagation()}
              >
                <input
                  className='border px-2 py-1 rounded flex-1'
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                />
                <button
                  type='button'
                  className='text-green-600 px-2 py-1'
                  onClick={e => {
                    e.stopPropagation();
                    onEditAssembly?.(assembly.id, editName);
                    setIsEditing(false);
                  }}
                >
                  Save
                </button>
                <button
                  type='button'
                  className='text-red-600 px-2 py-1'
                  onClick={e => {
                    e.stopPropagation();
                    setEditName(assembly.name);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                className='text-[17px] flex items-center justify-between cursor-pointer px-3 py-2 hover:bg-gray-50 rounded border border-gray-200 bg-white mb-2 select-none'
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div className='flex items-center'>
                  <span className='mr-2'>
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                  </span>
                  <span className='flex-1'>{assembly.name}</span>
                </div>
                {editMode && (
                  <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button
                      type='button'
                      className='text-gray-600 text-sm'
                      onClick={e => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type='button'
                      className='text-red-600 text-sm'
                      onClick={e => {
                        e.stopPropagation();
                        onDelete?.('assembly', assembly.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* parts list */}
            {isExpanded && (
              <SortableContext
                items={assembly.parts.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className='ml-6 space-y-1'>
                  {assembly.parts.map(part => (
                    <SortablePart
                      key={part.id}
                      nodeId={nodeId}
                      assemblyId={assembly.id}
                      part={part}
                    />
                  ))}
                </ul>
              </SortableContext>
            )}
          </div>
        </div>
      </li>
    );
  };

  // Sortable part component
  const SortablePart: React.FC<{
    nodeId: string;
    assemblyId: string;
    part: Part;
  }> = ({ nodeId, assemblyId, part }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(part.name);
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: part.id,
      data: { sortable: { containerId: `parts-${assemblyId}` } },
    });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        className={`text-base px-4 py-1 rounded cursor-pointer transition select-none flex items-center border border-gray-100 bg-white mb-2
          ${selectedPartId === part.id ? 'bg-blue-200 text-blue-900 font-semibold border-blue-300' : 'hover:bg-gray-100'}`}
      >
        {/* Drag handle */}
        {editMode && onReorder && (
          <span
            {...attributes}
            {...listeners}
            className='cursor-move mr-2 select-none text-gray-400 hover:text-gray-600'
          >
            ≡
          </span>
        )}
        <div
          className='flex-1 flex items-center justify-between'
          onClick={() => onSelectPart(part)}
        >
          {isEditing ? (
            <div
              className='flex items-center gap-2 w-full'
              onClick={e => e.stopPropagation()}
            >
              <input
                className='border px-2 py-1 rounded flex-1'
                value={editName}
                onChange={e => setEditName(e.target.value)}
                autoFocus
              />
              <button
                type='button'
                className='text-green-600 px-2 py-1'
                onClick={e => {
                  e.stopPropagation();
                  onEditPart?.(part.id, editName);
                  setIsEditing(false);
                }}
              >
                Save
              </button>
              <button
                type='button'
                className='text-red-600 px-2 py-1'
                onClick={e => {
                  e.stopPropagation();
                  setEditName(part.name);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <span>{part.name}</span>
              {editMode && (
                <div className='flex gap-2'>
                  <button
                    type='button'
                    className='text-gray-600 text-sm'
                    onClick={e => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type='button'
                    className='text-red-600 text-sm'
                    onClick={e => {
                      e.stopPropagation();
                      onDelete?.('part', part.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </li>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <ul className='space-y-2'>
        {data.map(node => (
          <li key={node.id}>
            {/* Press(루트) */}
            <div className='font-bold text-lg flex items-center cursor-pointer px-3 py-2 hover:bg-gray-50 rounded border border-gray-200 bg-white mb-2 select-none'>
              <span className='mr-2'>
                <ChevronDown />
              </span>
              <span>{node.name}</span>
            </div>
            <SortableContext
              items={node.assemblies.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className='ml-4 space-y-2'>
                {node.assemblies.map(assembly => (
                  <SortableAssembly
                    key={assembly.id}
                    nodeId={node.id}
                    assembly={assembly}
                  />
                ))}
              </ul>
            </SortableContext>
          </li>
        ))}
      </ul>
    </DndContext>
  );
}
