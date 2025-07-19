'use client';

import React, { useState } from 'react';
import { ModelOption } from '@/types/modelOption';

interface ModelOptionCardProps {
  option: ModelOption;
  onEdit: (option: ModelOption) => void;
  onDelete: (id: string) => void;
  onToggleActive: (option: ModelOption) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export default function ModelOptionCard({
  option,
  onEdit,
  onDelete,
  onToggleActive,
  isDragging = false,
  dragHandleProps = {}
}: ModelOptionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-all duration-200 ${
        isDragging 
          ? 'bg-blue-50 border-blue-300 shadow-lg' 
          : isHovered 
            ? 'bg-gray-50 border-gray-300' 
            : 'hover:bg-gray-50'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 드래그 핸들 */}
      <div
        {...dragHandleProps}
        className="flex items-center space-x-4 cursor-move"
      >
        <div className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {option.optionCode}
            </span>
            <span className="text-gray-500">-</span>
            <span className="text-sm text-gray-700">
              {option.optionName}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              순서: {option.order}
            </span>
            <button
              onClick={() => onToggleActive(option)}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                option.isActive
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              {option.isActive ? '활성' : '비활성'}
            </button>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(option)}
          className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
        >
          수정
        </button>
        <button
          onClick={() => onDelete(option.id)}
          className="text-red-600 hover:text-red-800 text-sm transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
} 