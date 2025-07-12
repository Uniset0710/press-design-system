import React from 'react';
import { ChecklistItem } from '@/app/types/checklist';
import CommentSection from '@/app/components/CommentSection';
import HistorySection from '@/app/components/HistorySection';

interface ChecklistItemModalProps {
  modalItem: ChecklistItem | null;
  modalEditMode: boolean;
  imagePreview: string | null;
  onClose: () => void;
  onEditModeToggle: () => void;
  onSave: () => void;
  onDelete: () => void;
  onItemChange: (item: ChecklistItem) => void;
  onFileUpload: (file: File) => void;
  onDeleteAttachment: (attachmentId: string) => void;
  onImagePreview: (url: string) => void;
  onImagePreviewClose: () => void;
}

const ChecklistItemModal: React.FC<ChecklistItemModalProps> = ({
  modalItem,
  modalEditMode,
  imagePreview,
  onClose,
  onEditModeToggle,
  onSave,
  onDelete,
  onItemChange,
  onFileUpload,
  onDeleteAttachment,
  onImagePreview,
  onImagePreviewClose
}) => {
  if (!modalItem) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded shadow-lg p-6 min-w-[600px] max-w-[98vw] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-bold mb-4">{modalEditMode ? '수정' : '상세 정보'}</h2>
          
          {/* 작업이름 */}
          <div className="mb-2">
            <label className="block text-xs font-semibold mb-1">작업 이름</label>
            {modalEditMode ? (
              <textarea 
                className="border rounded p-1 w-full min-h-[60px]" 
                value={modalItem.text || modalItem.description || ''} 
                onChange={e => onItemChange({ ...modalItem, text: e.target.value, description: e.target.value })} 
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded min-h-[40px]">{modalItem.text || modalItem.description}</div>
            )}
          </div>
          
          {/* 담당자 */}
          <div className="mb-2">
            <label className="block text-xs font-semibold mb-1">담당자</label>
            {modalEditMode ? (
              <input 
                type="text" 
                className="border rounded p-1 w-full" 
                value={modalItem.author || ''} 
                onChange={e => onItemChange({ ...modalItem, author: e.target.value })} 
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded min-h-[32px]">{modalItem.author || '-'}</div>
            )}
          </div>
          
          {/* 등록일자 */}
          <div className="mb-2">
            <label className="block text-xs font-semibold mb-1">등록일자</label>
            {modalEditMode ? (
              <input 
                type="date" 
                className="border rounded p-1 w-full" 
                value={modalItem.dueDate ? modalItem.dueDate.slice(0, 10) : ''} 
                onChange={e => onItemChange({ ...modalItem, dueDate: e.target.value })} 
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded min-h-[32px]">{modalItem.dueDate ? modalItem.dueDate.slice(0, 10) : '-'}</div>
            )}
          </div>
          
          {/* 분류 */}
          <div className="mb-2">
            <label className="block text-xs font-semibold mb-1">분류</label>
            {modalEditMode ? (
              <select
                className="border rounded p-1 w-full"
                value={(modalItem as any).category || ''}
                onChange={e => onItemChange({ ...modalItem, category: e.target.value } as any)}
              >
                <option value="">분류 선택</option>
                <option value="용접">용접</option>
                <option value="가공">가공</option>
                <option value="조립">조립</option>
              </select>
            ) : (
              <div className="p-2 bg-gray-50 rounded min-h-[32px]">{(modalItem as any).category || '-'}</div>
            )}
          </div>
          
          {/* 중요도 */}
          <div className="mb-2">
            <label className="block text-xs font-semibold mb-1">중요도</label>
            {modalEditMode ? (
              <select
                className="border rounded p-1 w-full"
                value={(modalItem as any).priority || ''}
                onChange={e => onItemChange({ ...modalItem, priority: e.target.value } as any)}
              >
                <option value="">중요도 선택</option>
                <option value="최상">최상</option>
                <option value="상">상</option>
                <option value="중">중</option>
                <option value="하">하</option>
                <option value="최하">최하</option>
              </select>
            ) : (
              <div className="p-2 bg-gray-50 rounded min-h-[32px]">{(modalItem as any).priority || '-'}</div>
            )}
          </div>
          
          {/* 첨부파일 */}
          <div className="mb-2">
            <label className="block text-xs font-semibold mb-1">첨부파일</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {modalItem.attachments && modalItem.attachments.length > 0 ? (
                modalItem.attachments.map(att => {
                  const isImage = att.mimeType?.startsWith('image/');
                  return (
                    <div key={att.id} className="flex items-center gap-1 border rounded px-2 py-1 bg-gray-50">
                      {isImage ? (
                        <img 
                          src={att.url || att.uri} 
                          alt={att.filename} 
                          className="w-10 h-10 object-cover rounded cursor-pointer" 
                          onClick={() => onImagePreview(att.url || att.uri || '')} 
                        />
                      ) : (
                        <a 
                          href={att.url || att.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline text-blue-600" 
                          download={att.filename}
                        >
                          {att.filename}
                        </a>
                      )}
                      {modalEditMode && (
                        <button 
                          className="text-red-500 ml-1" 
                          title="삭제" 
                          onClick={() => onDeleteAttachment(att.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <span className="text-gray-400">첨부 없음</span>
              )}
            </div>
            {modalEditMode && (
              <input 
                type="file" 
                onChange={e => { 
                  if (e.target.files && e.target.files[0]) { 
                    onFileUpload(e.target.files[0]); 
                  } 
                }} 
              />
            )}
          </div>

          {/* 코멘트 섹션 */}
          <CommentSection itemId={modalItem.id.toString()} />
          
          {/* 히스토리 섹션 */}
          <HistorySection entityType="checklist" entityId={modalItem.id.toString()} />

          {/* 버튼 그룹 */}
          <div className="flex gap-2 mt-4">
            {modalEditMode ? (
              <>
                <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={onSave}>
                  저장
                </button>
                <button className="px-3 py-1 bg-gray-300 text-black rounded" onClick={onEditModeToggle}>
                  취소
                </button>
              </>
            ) : (
              <>
                <button className="px-3 py-1 bg-yellow-500 text-white rounded" onClick={onEditModeToggle}>
                  수정
                </button>
                <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={onDelete}>
                  삭제
                </button>
                <button className="px-3 py-1 bg-gray-300 text-black rounded" onClick={onClose}>
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 미리보기 모달 */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onImagePreviewClose}>
          <img src={imagePreview} alt="미리보기" className="max-w-3xl max-h-[90vh] rounded shadow-lg" />
        </div>
      )}
    </>
  );
};

export default ChecklistItemModal; 