import { useMemo } from 'react';
import { PressNode } from '@/components/tree/TreeView';

export function useTreeSearch(treeData: PressNode[], searchTerm: string) {
  return useMemo(() => {
    if (!searchTerm) return treeData;

    return treeData
      .map(node => ({
        ...node,
        assemblies: node.assemblies
          .map(asm => ({
            ...asm,
            parts: asm.parts.filter(p =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
          }))
          .filter(
            asm =>
              asm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              asm.parts.length > 0
          ),
      }))
      .filter(
        node =>
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.assemblies.length > 0
      );
  }, [treeData, searchTerm]);
}
