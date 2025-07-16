import { useState, useEffect } from 'react';
import { ChecklistItem } from '@/app/types/checklist';
import { checklistApiRequest } from '@/utils/errorHandler';

interface CachedChecklist {
  data: Record<string, ChecklistItem[]>;
  fetchedAt: number;
}

export function useChecklistData(selectedPartId: string, session: any, modelId?: string) {
  const [checklistData, setChecklistData] = useState<
    Record<string, ChecklistItem[]>
  >({
    'Design Check List': [],
    'Machining Check List': [],
    'Assembly Check List': [],
  });
  const [checklistCache, setChecklistCache] = useState<
    Record<string, CachedChecklist>
  >({});

  function getCached(partId: string): CachedChecklist | null {
    const hit = checklistCache[partId];
    if (!hit) return null;
    if (Date.now() - hit.fetchedAt > 30_000) return null; // 30 seconds
    return hit;
  }

  function mutateChecklist(
    partId: string,
    mutator: (
      old: Record<string, ChecklistItem[]>
    ) => Record<string, ChecklistItem[]>
  ) {
    setChecklistData(old => {
      const next = mutator(old);
      setChecklistCache(prev => ({
        ...prev,
        [partId]: { data: next, fetchedAt: Date.now() },
      }));
      return next;
    });
  }

  useEffect(() => {
    if (!selectedPartId || !session) {
      console.log('⚠️ 체크리스트 로딩 스킵 - selectedPartId:', selectedPartId, 'session:', !!session);
      setChecklistData({
        'Design Check List': [],
        'Machining Check List': [],
        'Assembly Check List': [],
      });
      return;
    }

    const cacheKey = `${selectedPartId}-${modelId || 'all'}`;
    console.log('🔍 체크리스트 캐시 키:', cacheKey);
    const hit = getCached(cacheKey);
    if (hit) {
      console.log('✅ 캐시에서 체크리스트 데이터 로드');
      setChecklistData(hit.data);
      return;
    }

    console.log('🔄 체크리스트 데이터 로딩 시작 - partId:', selectedPartId, 'modelId:', modelId);
    setChecklistData({
      'Design Check List': [],
      'Machining Check List': [],
      'Assembly Check List': [],
    });
    
    // 기종별 필터링을 지원하는 API 요청
    const url = modelId 
      ? `/api/checklist/${selectedPartId}?modelId=${modelId}`
      : `/api/checklist/${selectedPartId}`;
      
    console.log('📡 API 요청 URL:', url);
    
    checklistApiRequest(url, undefined, {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    }, session)
      .then((data: any) => {
        console.log('✅ 체크리스트 데이터 로드 성공:', data);
        
        // 백엔드에서 받은 데이터를 섹션별로 분류
        const sectionedData: Record<string, ChecklistItem[]> = {
          'Design Check List': [],
          'Machining Check List': [],
          'Assembly Check List': [],
        };

        // 데이터가 배열인 경우 섹션별로 분류
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            let section = item.section;
            if (!section || !['Design Check List', 'Machining Check List', 'Assembly Check List'].includes(section)) {
              section = 'Design Check List';
            }
            sectionedData[section].push({
              ...item,
              optionType: item.optionType || 'DTL', // 기본값 설정
            });
          });
        } else if (typeof data === 'object') {
          // 옵션별(DTL, DTE 등)로 분리된 데이터를 섹션별로 합침
          Object.entries(data).forEach(([optionType, arr]: [string, any]) => {
            if (Array.isArray(arr)) {
              arr.forEach((item: any) => {
                let section = item.section;
                if (!section || !['Design Check List', 'Machining Check List', 'Assembly Check List'].includes(section)) {
                  section = 'Design Check List';
                }
                sectionedData[section].push({
                  ...item,
                  optionType: optionType, // 옵션 타입을 명시적으로 설정
                });
              });
            }
          });
        }

        console.log('Processed sectioned data:', sectionedData); // 디버깅용
        setChecklistData(sectionedData);
        setChecklistCache(prev => ({
          ...prev,
          [cacheKey]: { data: sectionedData, fetchedAt: Date.now() },
        }));
      })
      .catch(error => {
        console.error('❌ 체크리스트 데이터 로딩 실패:', error);
        setChecklistData({
          'Design Check List': [],
          'Machining Check List': [],
          'Assembly Check List': [],
        });
      });
  }, [selectedPartId, session, modelId]); // modelId를 의존성에 추가

  return {
    checklistData,
    setChecklistData,
    mutateChecklist,
    checklistCache,
    setChecklistCache,
  };
}
