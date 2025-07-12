import { v4 as uuid } from 'uuid';
import {
  AttachmentData,
  AttachmentResponse,
  ChecklistItem,
  ChecklistData,
  NetworkError,
} from '@/types/checklist';

export async function uploadAttachment(
  file: File,
  item: ChecklistItem,
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistData>>
) {
  // 1. 낙관적 업데이트 - 임시 첨부 추가
  const tempId = 'temp-' + uuid();
  const blobUrl = URL.createObjectURL(file);

  const tempAtt: AttachmentData = {
    id: tempId,
    checklistItemId: item.id,
    filename: file.name,
    mimeType: file.type,
    url: blobUrl,
    isTemp: true,
  };

  setChecklist(prev => ({
    ...prev,
    [item.optionType]: prev[item.optionType].map(ci =>
      ci.id === item.id
        ? { ...ci, attachments: [...ci.attachments, tempAtt] }
        : ci
    ),
  }));

  // 2. 서버 업로드
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('checklistItemId', item.id);

    const res = await fetch('/api/attachments', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');

    const saved: AttachmentResponse = await res.json();

    // 3. 임시 첨부를 실제 데이터로 교체
    setChecklist(prev => ({
      ...prev,
      [item.optionType]: prev[item.optionType].map(ci =>
        ci.id === item.id
          ? {
              ...ci,
              attachments: ci.attachments.map(a =>
                a.id === tempId
                  ? {
                      id: saved.id,
                      checklistItemId: saved.checklistItemId,
                      filename: saved.filename,
                      mimeType: saved.mimeType,
                      url: saved.url,
                      size: saved.size,
                      createdAt: saved.createdAt,
                    }
                  : a
              ),
            }
          : ci
      ),
    }));
  } catch (e) {
    // 4. 실패 시 롤백
    if (e instanceof TypeError) {
      throw new NetworkError('네트워크 연결을 확인해주세요.', e);
    }

    setChecklist(prev => ({
      ...prev,
      [item.optionType]: prev[item.optionType].map(ci =>
        ci.id === item.id
          ? {
              ...ci,
              attachments: ci.attachments.filter(a => a.id !== tempId),
            }
          : ci
      ),
    }));

    console.error('Upload failed:', e);
    throw e;
  } finally {
    // 5. 메모리 정리
    URL.revokeObjectURL(blobUrl);
  }
}
