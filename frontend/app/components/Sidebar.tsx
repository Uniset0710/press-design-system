'use client';
import React, { useRef, useState } from 'react';
import TreeView, { PressNode, Part } from './TreeView';

function filterTree(treeData: PressNode[], searchTerm: string): PressNode[] {
  if (!searchTerm.trim()) return treeData;
  const lower = searchTerm.toLowerCase();
  return treeData
    .map(press => {
      const filteredAssemblies = press.assemblies
        .map(asm => ({
          ...asm,
          parts: asm.parts.filter(part =>
            part.name.toLowerCase().includes(lower)
          ),
        }))
        .filter(asm =>
          asm.name.toLowerCase().includes(lower) ||
          asm.parts.length > 0
        );
      if (
        press.name.toLowerCase().includes(lower) ||
        filteredAssemblies.length > 0
      ) {
        return { ...press, assemblies: filteredAssemblies };
      }
      return null;
    })
    .filter(Boolean) as PressNode[];
}

interface SidebarProps {
  treeData: PressNode[];
  selectedPart: Part | null;
  selectedPartId: string;
  assemblyExpanded: Record<string, boolean>;
  sidebarWidth: number;
  searchTerm: string;
  isEditMode: boolean;
  newPartName: string;
  selectedAssemblyId: string;
  newAssemblyName: string;
  onSelectPart: (part: Part) => void;
  onAddPart: () => Promise<void>;
  onEditPart: (partId: string, newName: string) => Promise<void>;
  onEditAssembly: (assemblyId: string, newName: string) => Promise<void>;
  onDelete: (type: 'part' | 'assembly', id: string) => Promise<void>;
  onReorder: (type: 'moveAssembly' | 'movePart', payload: any) => Promise<void>;
  onAddAssembly: () => Promise<void>;
  onToggleNode: (nodeId: string) => void;
  onToggleAssembly: (assemblyId: string) => void;
  onSetAssemblyExpanded: (expanded: Record<string, boolean>) => void;
  onSetNewPartName: (name: string) => void;
  onSetSelectedAssemblyId: (id: string) => void;
  onSetNewAssemblyName: (name: string) => void;
  onSetSearchTerm: (term: string) => void;
  onSetIsEditMode: (mode: boolean) => void;
  onSetSidebarWidth: (width: number) => void;
  isAdmin?: boolean;
}

export default function Sidebar({
  treeData,
  selectedPart,
  selectedPartId,
  assemblyExpanded,
  sidebarWidth,
  searchTerm,
  isEditMode,
  newPartName,
  selectedAssemblyId,
  newAssemblyName,
  onSelectPart,
  onAddPart,
  onEditPart,
  onEditAssembly,
  onDelete,
  onReorder,
  onAddAssembly,
  onToggleNode,
  onToggleAssembly,
  onSetAssemblyExpanded,
  onSetNewPartName,
  onSetSelectedAssemblyId,
  onSetNewAssemblyName,
  onSetSearchTerm,
  onSetIsEditMode,
  onSetSidebarWidth,
  isAdmin,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      onSetSidebarWidth(Math.max(200, Math.min(600, newWidth)));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // 필터링된 트리 데이터 생성
  const filteredTreeData = filterTree(treeData, searchTerm);

  return (
    <div
      ref={sidebarRef}
      className="bg-white border-r border-gray-200 flex flex-col h-full"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Press Tree</h2>
          {isAdmin && (
            <button
              onClick={() => onSetIsEditMode(!isEditMode)}
              className={`px-3 py-1 text-sm rounded ${
                isEditMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isEditMode ? 'View' : 'Edit'}
            </button>
          )}
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search parts..."
            value={searchTerm}
            onChange={(e) => onSetSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isEditMode && isAdmin && (
          <div className="space-y-3 mb-4">
            <div>
              <input
                type="text"
                placeholder="New assembly name"
                value={newAssemblyName}
                onChange={(e) => onSetNewAssemblyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={onAddAssembly}
                disabled={!newAssemblyName.trim()}
                className="w-full mt-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Assembly
              </button>
            </div>

            <div>
              <select
                value={selectedAssemblyId}
                onChange={(e) => onSetSelectedAssemblyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select assembly for new part</option>
                {treeData.flatMap(press =>
                  press.assemblies.map(assembly => (
                    <option key={assembly.id} value={assembly.id}>
                      {press.name} / {assembly.name}
                    </option>
                  ))
                )}
              </select>
              <input
                type="text"
                placeholder="New part name"
                value={newPartName}
                onChange={(e) => onSetNewPartName(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={onAddPart}
                disabled={!selectedAssemblyId || !newPartName.trim()}
                className="w-full mt-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Part
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <TreeView
          data={filteredTreeData}
          selectedPartId={selectedPartId}
          assemblyExpanded={assemblyExpanded}
          editMode={isEditMode}
          onSelectPart={onSelectPart}
          onEditPart={onEditPart}
          onEditAssembly={onEditAssembly}
          onDelete={onDelete}
          onReorder={onReorder}
          onToggleAssembly={onToggleAssembly}
          isAdmin={isAdmin}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 cursor-col-resize bg-gray-300 hover:bg-gray-400"
        style={{ left: `${sidebarWidth}px` }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
} 