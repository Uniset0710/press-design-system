'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ModelOption } from '@/types/modelOption';
import ModelOptionCard from './ModelOptionCard';
import { reorderModelOptions } from '@/lib/modelOptionApi';
import { toast } from 'react-hot-toast';

interface DraggableOptionListProps {
  options: ModelOption[];
  modelId: string;
  section: string;
  onEdit: (option: ModelOption) => void;
  onDelete: (id: string) => void;
  onToggleActive: (option: ModelOption) => void;
  onReorder: (newOptions: ModelOption[]) => void;
}

// 드래그 가능한 옵션 아이템 컴포넌트
function SortableOptionItem({ 
  option, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: {
  option: ModelOption;
  onEdit: (option: ModelOption) => void;
  onDelete: (id: string) => void;
  onToggleActive: (option: ModelOption) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ModelOptionCard
        option={option}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function DraggableOptionList({
  options,
  modelId,
  section,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder
}: DraggableOptionListProps) {
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = options.findIndex(option => option.id === active.id);
      const newIndex = options.findIndex(option => option.id === over?.id);

      const newOptions = arrayMove(options, oldIndex, newIndex);

      // 순서 업데이트
      const updatedOptions = newOptions.map((item, index) => ({
        ...item,
        order: index
      }));

      try {
        setIsReordering(true);
        
        // 백엔드에 순서 변경 요청
        const optionIds = updatedOptions.map(option => option.id);
        await reorderModelOptions(modelId, section, optionIds);
        
        // 로컬 상태 업데이트
        onReorder(updatedOptions);
        
        toast.success('옵션 순서가 변경되었습니다.');
      } catch (error) {
        console.error('옵션 순서 변경 오류:', error);
        toast.error('옵션 순서 변경에 실패했습니다.');
      } finally {
        setIsReordering(false);
      }
    }
  };

  if (options.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">등록된 옵션이 없습니다.</p>
        <p className="text-gray-400 text-sm mt-2">
          새 옵션을 추가해보세요.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={options.map(option => option.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`space-y-3 transition-opacity duration-200 ${
          isReordering ? 'opacity-50' : 'opacity-100'
        }`}>
          {options.map((option) => (
            <SortableOptionItem
              key={option.id}
              option={option}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 