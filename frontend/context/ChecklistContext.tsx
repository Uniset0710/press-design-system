import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChecklistItem } from '@/app/types/checklist';
import { PressNode, Part } from '@/components/tree/TreeView';

interface ChecklistContextType {
  selectedPart: Part | null;
  setSelectedPart: (part: Part | null) => void;
  selectedPartId: string;
  setSelectedPartId: (id: string) => void;
  checklistData: Record<string, ChecklistItem[]>;
  setChecklistData: React.Dispatch<React.SetStateAction<Record<string, ChecklistItem[]>>>;
  openNodes: Record<string, boolean>;
  setOpenNodes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  openAssemblies: Record<string, boolean>;
  setOpenAssemblies: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [checklistData, setChecklistData] = useState<Record<string, ChecklistItem[]>>({});
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
  const [openAssemblies, setOpenAssemblies] = useState<Record<string, boolean>>({});

  return (
    <ChecklistContext.Provider value={{
      selectedPart, setSelectedPart,
      selectedPartId, setSelectedPartId,
      checklistData, setChecklistData,
      openNodes, setOpenNodes,
      openAssemblies, setOpenAssemblies
    }}>
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklistContext() {
  const ctx = useContext(ChecklistContext);
  if (!ctx) throw new Error('ChecklistContext not found');
  return ctx;
} 