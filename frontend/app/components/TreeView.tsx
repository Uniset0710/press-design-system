'use client';
import React, { useState, useEffect } from 'react';
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
import PermissionGuard from './PermissionGuard';

export interface Part {
  id: string;
  name: string;
}
export interface Assembly {
  id: string;
  name: string;
  parts: Part[];
}
export interface PressNode {
  id: string;
  name: string;
  assemblies: Assembly[];
}

interface TreeViewProps {
  data: PressNode[];
  selectedPartId?: string;
  onSelectPart: (part: Part) => void;
  onEditPart: (partId: string, newName: string) => void;
  onEditAssembly: (assemblyId: string, newName: string) => void;
  onDelete: (type: 'part' | 'assembly', id: string) => void;
  onReorder: (
    type: 'moveAssembly' | 'movePart',
    payload: any
  ) => void;
  editMode?: boolean;
  assemblyExpanded: Record<string, boolean>;
  onToggleAssembly: (assemblyId: string) => void;
  isAdmin?: boolean;
}

export default function TreeView({
  data,
  selectedPartId,
  onSelectPart,
  onEditPart,
  onEditAssembly,
  onDelete,
  onReorder,
  editMode = false,
  assemblyExpanded,
  onToggleAssembly,
  isAdmin,
}: TreeViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  console.log('트리 데이터(data):', data);
  data.forEach(node => {
    console.log('node.id:', node.id, 'node.name:', node.name);
  });

  // collapse state for root nodes (assemblies list)
  const [rootExpanded, setRootExpanded] = useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      data.forEach(node => {
        init[node.id] = String(node.name).toLowerCase().includes('press');
      });
      return init;
    }
  );

  useEffect(() => {
    setRootExpanded(prev => {
      if (Object.values(prev).some(Boolean)) return prev;
      const map: Record<string, boolean> = {};
      data.forEach(node => {
        map[node.id] = String(node.name).toLowerCase().includes('press');
      });
      return map;
    });
  }, [data]);

  const toggleRoot = (nodeId: string) => {
    setRootExpanded(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };



  const handleDragEnd = (event: DragEndEvent) => {
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

  // Custom handler to expand only the assembly containing the selected part
  const handleSelectPart = (part: Part) => {
    onSelectPart(part);

    let foundRootId: string | undefined;
    let foundAssemblyId: string | undefined;
    data.forEach(node => {
      node.assemblies.forEach(asm => {
        if (asm.parts.some(p => p.id === part.id)) {
          foundRootId = node.id;
          foundAssemblyId = asm.id;
        }
      });
    });

    // Press(루트)는 항상 열려 있게
    if (foundRootId) {
      setRootExpanded(prev => ({
        ...prev,
        [foundRootId!]: true,
      }));
    }

    // MC BLOCK(어셈블리)는 여러 개 열릴 수 있게, 기존 상태 보존
    if (foundAssemblyId && !assemblyExpanded[foundAssemblyId]) {
      onToggleAssembly(foundAssemblyId!);
    }

    console.log('rootExpanded:', rootExpanded);
    console.log('assemblyExpanded:', assemblyExpanded);
  };

  // Sortable assembly row
  const AssemblyRow: React.FC<{
    nodeId: string;
    assembly: Assembly;
    expanded: boolean;
    setExpanded: (v: boolean) => void;
  }> = ({ nodeId, assembly, expanded, setExpanded }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(assembly.name);
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
          {isAdmin && (
            <span
              {...attributes}
              {...listeners}
              className='cursor-move mr-2 select-none'
            >
              ≡
            </span>
          )}
          <div className='flex-1'>
            {isEditing ? (
              <div
                className='flex items-center gap-2 p-2 bg-white rounded shadow'
                onClick={e => e.stopPropagation()}
              >
                <input
                  className='border px-2 py-1 rounded'
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                />
                <button
                  type='button'
                  className='text-green-600'
                  onClick={e => {
                    e.stopPropagation();
                    onEditAssembly(assembly.id, editName);
                    setIsEditing(false);
                  }}
                >
                  Save
                </button>
                <button
                  type='button'
                  className='text-red-600'
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
                className='flex items-center justify-between p-2 bg-white rounded shadow cursor-pointer'
                onClick={e => {
                  e.stopPropagation();
                  onToggleAssembly(assembly.id);
                }}
              >
                <span className='mr-2'>{expanded ? '▾' : '▸'}</span>
                <span>{assembly.name}</span>
                {editMode && isAdmin && (
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      className='text-gray-600'
                      onClick={e => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                    >
                      Edit
                    </button>
                    <PermissionGuard
                      requiredRole="admin"
                    >
                      <button
                        type='button'
                        className='text-red-600'
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm('정말로 이 조립체를 삭제하시겠습니까?')) {
                            onDelete('assembly', assembly.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </PermissionGuard>
                  </div>
                )}
              </div>
            )}
            {/* parts list */}
            {expanded && (
              <SortableContext
                items={assembly.parts.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className='ml-8 list-none mt-1 space-y-1'>
                  {assembly.parts.map(part => (
                    <PartRow
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

  // Sortable part row
  const PartRow: React.FC<{
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
        className={`flex items-center p-1 hover:bg-gray-100 rounded ${selectedPartId === part.id ? 'bg-blue-100' : ''}`}
      >
        {/* Drag handle */}
        {isAdmin && (
          <span
            {...attributes}
            {...listeners}
            className='cursor-move mr-2 select-none'
          >
            ≡
          </span>
        )}
        <div
          className='flex-1 flex items-center justify-between'
          onClick={e => {
            e.stopPropagation();
            handleSelectPart(part);
          }}
        >
          {isEditing ? (
            <div
              className='flex items-center gap-2 w-full'
              onClick={e => e.stopPropagation()}
            >
              <input
                className='border px-2 py-1 rounded'
                value={editName}
                onChange={e => setEditName(e.target.value)}
                autoFocus
              />
              <button
                type='button'
                className='text-green-600'
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  onEditPart(part.id, editName);
                  setIsEditing(false);
                }}
              >
                Save
              </button>
              <button
                type='button'
                className='text-red-600'
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
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
              {editMode && isAdmin && (
                <div className='flex gap-2'>
                  <button
                    type='button'
                    className='text-gray-600'
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <PermissionGuard
                    requiredRole="admin"
                  >
                    <button
                      type='button'
                      className='text-red-600'
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (window.confirm('정말로 이 부품을 삭제하시겠습니까?')) {
                          onDelete('part', part.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </PermissionGuard>
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
      <ul className='space-y-4'>
        {data.map(node => (
          <li key={node.id} className='space-y-2'>
            <div
              className='font-semibold mb-1 cursor-pointer'
              onClick={() => toggleRoot(node.id)}
            >
              {rootExpanded[node.id] ? '▾' : '▸'} {node.name}
            </div>
            {rootExpanded[node.id] && (
              <SortableContext
                items={node.assemblies.map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className='ml-4 space-y-2'>
                  {node.assemblies.map(assembly => (
                    <AssemblyRow
                      key={assembly.id}
                      nodeId={node.id}
                      assembly={assembly}
                      expanded={!!assemblyExpanded[assembly.id]}
                      setExpanded={v => {
                        if (v !== !!assemblyExpanded[assembly.id]) {
                          onToggleAssembly(assembly.id);
                        }
                      }}
                    />
                  ))}
                </ul>
              </SortableContext>
            )}
          </li>
        ))}
      </ul>
    </DndContext>
  );
}
