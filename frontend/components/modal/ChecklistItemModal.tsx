import React, { useEffect, useRef } from 'react';
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
  isAdmin?: boolean;
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
  onImagePreviewClose,
  isAdmin,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (modalItem) {
      document.addEventListener('keydown', handleEscape);
      // 포커스 트랩 설정
      document.body.style.overflow = 'hidden';
      
      // 모달이 열릴 때 첫 번째 포커스 가능한 요소에 포커스
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modalItem, onClose]);

  if (!modalItem) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" 
        onClick={onClose}
        aria-hidden="true"
      >
        <div 
          ref={modalRef}
          className="bg-white rounded shadow-lg p-6 min-w-[600px] w-[700px] max-w-[98vw] max-h-[90vh] min-h-[500px] overflow-y-auto" 
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <h2 id="modal-title" className="text-lg font-bold mb-4">
            {modalEditMode ? '수정' : '상세 정보'}
          </h2>
          <div id="modal-description" className="sr-only">
            체크리스트 항목의 상세 정보를 확인하고 편집할 수 있습니다.
          </div>
          
          {/* 작업이름 */}
          <div className="mb-2">
            <label className="block text-xs font-semibold mb-1" htmlFor="task-name">작업 이름</label>
            {modalEditMode ? (
              <textarea 
                id="task-name"
                className="border rounded p-1 w-full min-h-[140px]" 
                rows={7}
                value={modalItem.text || modalItem.description || ''} 
                onChange={e => onItemChange({ ...modalItem, text: e.target.value, description: e.target.value })} 
                aria-label="작업 이름을 입력하세요"
              />
            ) : (
              <div 
                className="p-2 bg-gray-50 rounded min-h-[140px] whitespace-pre-line"
                aria-label="작업 이름"
              >
                {modalItem.text || modalItem.description}
              </div>
            )}
          </div>

          {/* 담당자/등록일자 */}
          <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1" htmlFor="author-input">담당자</label>
              {modalEditMode ? (
                <input 
                  id="author-input"
                  type="text" 
                  className="border rounded p-1 w-full" 
                  value={modalItem.author || ''} 
                  onChange={e => onItemChange({ ...modalItem, author: e.target.value })} 
                  aria-label="담당자 이름을 입력하세요"
                />
              ) : (
                <div 
                  className="p-2 bg-gray-50 rounded min-h-[32px]"
                  aria-label="담당자"
                >
                  {modalItem.author || '-'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" htmlFor="due-date-input">등록일자</label>
              {modalEditMode ? (
                <input 
                  id="due-date-input"
                  type="date" 
                  className="border rounded p-1 w-full" 
                  value={modalItem.dueDate ? modalItem.dueDate.slice(0, 10) : ''} 
                  onChange={e => onItemChange({ ...modalItem, dueDate: e.target.value })} 
                  aria-label="등록일자를 선택하세요"
                />
              ) : (
                <div 
                  className="p-2 bg-gray-50 rounded min-h-[32px]"
                  aria-label="등록일자"
                >
                  {modalItem.dueDate ? modalItem.dueDate.slice(0, 10) : '-'}
                </div>
              )}
            </div>
          </div>

          {/* 분류/중요도 */}
          <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1" htmlFor="category-select">분류</label>
              {modalEditMode ? (
                <select
                  id="category-select"
                  className="border rounded p-1 w-full"
                  value={(modalItem as any).category || ''}
                  onChange={e => onItemChange({ ...modalItem, category: e.target.value } as any)}
                  aria-label="분류를 선택하세요"
                >
                  <option value="">분류 선택</option>
                  <option value="용접">용접</option>
                  <option value="가공">가공</option>
                  <option value="조립">조립</option>
                </select>
              ) : (
                <div 
                  className="p-2 bg-gray-50 rounded min-h-[32px]"
                  aria-label="분류"
                >
                  {(modalItem as any).category || '-'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" htmlFor="priority-select">중요도</label>
              {modalEditMode ? (
                <select
                  id="priority-select"
                  className="border rounded p-1 w-full"
                  value={(modalItem as any).priority || ''}
                  onChange={e => onItemChange({ ...modalItem, priority: e.target.value } as any)}
                  aria-label="중요도를 선택하세요"
                >
                  <option value="">중요도 선택</option>
                  <option value="최상">최상</option>
                  <option value="상">상</option>
                  <option value="중">중</option>
                  <option value="하">하</option>
                  <option value="최하">최하</option>
                </select>
              ) : (
                <div 
                  className="p-2 bg-gray-50 rounded min-h-[32px]"
                  aria-label="중요도"
                >
                  {(modalItem as any).priority || '-'}
                </div>
              )}
            </div>
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
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onImagePreview(att.url || att.uri || '');
                            }
                          }}
                          aria-label={`${att.filename} 이미지 미리보기`}
                        />
                      ) : (
                        <a 
                          href={att.url || att.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline text-blue-600" 
                          download={att.filename}
                          aria-label={`${att.filename} 다운로드`}
                        >
                          {att.filename}
                        </a>
                      )}
                      {modalEditMode && (
                        <button 
                          className="text-red-500 ml-1" 
                          title="삭제" 
                          onClick={() => onDeleteAttachment(att.id)}
                          aria-label={`${att.filename} 첨부파일 삭제`}
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
                aria-label="파일 첨부"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
            )}
          </div>

          {/* 코멘트 섹션 */}
          <CommentSection itemId={modalItem.id.toString()} />
          
          {/* 히스토리 섹션 */}
          <HistorySection entityType="checklist" entityId={modalItem.id.toString()} />

          {/* 버튼 그룹 */}
          <div className="flex gap-2 mt-4">
            {isAdmin && (
              modalEditMode ? (
                <>
                  <button 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm font-semibold" 
                    onClick={onSave}
                    aria-label="변경사항 저장"
                  >
                    저장
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300" 
                    onClick={onEditModeToggle}
                    aria-label="편집 취소"
                  >
                    취소
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm" 
                    onClick={onDelete}
                    aria-label="항목 삭제"
                  >
                    삭제
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm font-semibold" 
                    onClick={onEditModeToggle}
                    aria-label="항목 편집"
                  >
                    수정
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300" 
                    onClick={onClose}
                    aria-label="모달 닫기"
                  >
                    닫기
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm" 
                    onClick={onDelete}
                    aria-label="항목 삭제"
                  >
                    삭제
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* 이미지 미리보기 모달 */}
      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" 
          onClick={onImagePreviewClose}
          aria-hidden="true"
        >
          <img 
            src={imagePreview} 
            alt="미리보기" 
            className="max-w-3xl max-h-[90vh] rounded shadow-lg" 
            role="img"
            aria-label="첨부파일 이미지 미리보기"
          />
        </div>
      )}
    </>
  );
};

export default ChecklistItemModal; 