import { useState, useEffect } from 'react';
import { ChecklistItem } from '@/app/types/checklist';

interface CachedChecklist {
  data: Record<string, ChecklistItem[]>;
  fetchedAt: number;
}

export function useChecklistData(selectedPartId: string, session: any) {
  const [checklistData, setChecklistData] = useState<Record<string, ChecklistItem[]>>({
    DTL: [], DTE: [], DL: [], DE: [], '2P': [], '4P': []
  });
  const [checklistCache, setChecklistCache] = useState<Record<string, CachedChecklist>>({});

  function getCached(partId: string): CachedChecklist | null {
    const hit = checklistCache[partId];
    if (!hit) return null;
    if (Date.now() - hit.fetchedAt > 30_000) return null; // 30 seconds
    return hit;
  }

  function mutateChecklist(
    partId: string,
    mutator: (old: Record<string, ChecklistItem[]>) => Record<string, ChecklistItem[]>
  ) {
    setChecklistData(old => {
      const next = mutator(old);
      setChecklistCache(prev => ({
        ...prev,
        [partId]: { data: next, fetchedAt: Date.now() }
      }));
      return next;
    });
  }

  useEffect(() => {
    if (!selectedPartId || !session) {
      setChecklistData({});
      return;
    }

    const hit = getCached(selectedPartId);
    if (hit) {
      setChecklistData(hit.data);
      return;
    }

    setChecklistData({});
    fetch(`/api/checklist/${selectedPartId}`, {
      headers: { Authorization: `Bearer ${session?.accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setChecklistData(data);
        setChecklistCache(prev => ({
          ...prev,
          [selectedPartId]: { data, fetchedAt: Date.now() }
        }));
      });
  }, [selectedPartId, session]);

  return {
    checklistData,
    setChecklistData,
    mutateChecklist,
    checklistCache,
    setChecklistCache
  };
} 