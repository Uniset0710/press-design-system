"use client";
import React from "react";

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
 * - 반응형 디자인으로 모바일에서도 사용 가능합니다
 * 
 * @example
 * ```tsx
 * <TreeView
 *   data={pressData}
 *   onSelectPart={handlePartSelect}
 *   selectedPartId={selectedPart?.id}
 *   openNodes={openNodes}
 *   onToggleNode={handleNodeToggle}
 *   openAssemblies={openAssemblies}
 *   onToggleAssembly={handleAssemblyToggle}
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
  /** 열린 노드들의 상태 */
  openNodes: Record<string, boolean>;
  /** 노드 토글 이벤트 핸들러 */
  onToggleNode: (nodeId: string) => void;
  /** 열린 조립체들의 상태 */
  openAssemblies: Record<string, boolean>;
  /** 조립체 토글 이벤트 핸들러 */
  onToggleAssembly: (assemblyId: string) => void;
}

function ChevronRight() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function TreeView({ data, onSelectPart, selectedPartId, openNodes, onToggleNode, openAssemblies, onToggleAssembly }: TreeViewProps) {
  return (
    <ul className="space-y-2">
      {data.map((node) => (
        <li key={node.id}>
          {/* Press(루트) */}
          <div
            className="font-bold text-lg flex items-center cursor-pointer px-3 py-2 hover:bg-gray-50 rounded border border-gray-200 bg-white mb-2 select-none"
            onClick={() => onToggleNode(node.id)}
          >
            <span className="mr-2">{openNodes[node.id] ? <ChevronDown /> : <ChevronRight />}</span>
            <span>{node.name}</span>
          </div>
          {openNodes[node.id] && (
            <ul className="ml-4 space-y-2">
              {node.assemblies.map((asm) => (
                <li key={asm.id}>
                  {/* Assembly */}
                  <div
                    className="text-[17px] flex items-center justify-end cursor-pointer px-3 py-2 hover:bg-gray-50 rounded border border-gray-200 bg-white mb-2 select-none"
                    onClick={() => onToggleAssembly(asm.id)}
                  >
                    <span className="mr-2">{openAssemblies[asm.id] ? <ChevronDown /> : <ChevronRight />}</span>
                    <span className="flex-1 text-right">{asm.name}</span>
                  </div>
                  {openAssemblies[asm.id] && (
                    <ul className="ml-6 space-y-1">
                      {asm.parts.map((part) => (
                        <li key={part.id}>
                          {/* Part */}
                          <div
                            className={`text-base px-4 py-1 rounded cursor-pointer transition select-none flex items-center border border-gray-100 bg-white mb-2
                              ${selectedPartId === part.id ? 'bg-blue-200 text-blue-900 font-semibold border-blue-300' : 'hover:bg-gray-100'}`}
                            onClick={() => onSelectPart(part)}
                          >
                            {part.name}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
} 