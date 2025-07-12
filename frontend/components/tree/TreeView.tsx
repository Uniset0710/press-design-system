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
}

export default function TreeView({ data, onSelectPart, selectedPartId }: TreeViewProps) {
  return (
    <ul className="space-y-2">
      {data.map((node) => (
        <li key={node.id}>
          <div className="font-semibold mb-1">{node.name}</div>
          <ul className="ml-4 space-y-1">
            {node.assemblies.map((asm) => (
              <li key={asm.id}>
                <div className="font-medium mb-1">{asm.name}</div>
                <ul className="ml-4 space-y-1">
                  {asm.parts.map((part) => (
                    <li key={part.id}>
                      <div
                        className={`cursor-pointer px-2 py-1 rounded ${
                          selectedPartId === part.id ? "bg-blue-200" : "hover:bg-gray-200"
                        }`}
                        onClick={() => onSelectPart(part)}
                      >
                        {part.name}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
} 