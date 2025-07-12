"use client";
import React from "react";

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
  onSelectPart: (part: Part) => void;
  selectedPartId?: string;
  openNodes: Record<string, boolean>;
  onToggleNode: (nodeId: string) => void;
  openAssemblies: Record<string, boolean>;
  onToggleAssembly: (assemblyId: string) => void;
}

const ChevronRight = (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const ChevronDown = (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

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
            <span className="mr-2">{openNodes[node.id] ? ChevronDown : ChevronRight}</span>
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
                    <span className="mr-2">{openAssemblies[asm.id] ? ChevronDown : ChevronRight}</span>
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