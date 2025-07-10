"use client";
import React, { useEffect } from 'react';
import ItemToolbar from './checklist/ItemToolbar';
import EditForm from './checklist/EditForm';
import TextWithAttachments from './checklist/TextWithAttachments';
import { ChecklistItem, AttachmentData } from '@/app/types/checklist';

interface ChecklistItemProps {
  item: ChecklistItem;
  isEditing?: boolean;
  canEdit?: boolean;
  onStartEdit: () => void;
  onEdit: (id: string, text: string) => void;
  onCancelEdit: () => void;
  onDelete?: (id: string) => void;
  attachments?: Array<AttachmentData>;
  onAttach?: (file: File, item: ChecklistItem) => Promise<void>;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  highlight?: string;
}

const ChecklistItemComponent: React.FC<ChecklistItemProps> = ({
  item,
  isEditing = false,
  canEdit = true,
  onStartEdit,
  onEdit,
  onCancelEdit,
  onDelete,
  attachments = [],
  onAttach,
  onDeleteAttachment,
  highlight = "",
}) => {
  useEffect(() => {
    console.log('❗️attachments length', attachments?.length, attachments);
    console.log('✅ ChecklistItemComponent item:', item);
  }, [attachments, item]);

  return (
    <li className="border p-2 rounded flex items-center gap-2">
      {/* NEW/수정됨 뱃지 */}
      {(() => {
        const now = Date.now();
        const created = item.createdAt ? new Date(item.createdAt).getTime() : 0;
        const updated = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
        const isNew = created && now - created < 24 * 60 * 60 * 1000;
        const isUpdated = updated && updated !== created && now - updated < 24 * 60 * 60 * 1000;
        return (
          <>
            {isNew && <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">NEW</span>}
            {!isNew && isUpdated && <span className="ml-1 px-2 py-0.5 bg-yellow-400 text-black text-xs rounded-full">수정됨</span>}
          </>
        );
      })()}
      {/* 1) 툴바: 전체 editMode일 때만 노출 */}
      {canEdit && !isEditing && onAttach && onDelete && (
        <ItemToolbar
          onStartEdit={onStartEdit}
          onDelete={() => onDelete(item.id)}
          onAttach={(file) => onAttach(file, item)}
        />
      )}

      {/* 2) 본문: 편집 중이면 textarea, 아니면 텍스트+첨부파일 */}
      {isEditing ? (
        <EditForm
          text={item.text}
          onSave={(text) => onEdit(item.id, text)}
          onCancel={onCancelEdit}
        />
      ) : (
        <div className="flex-1">
          <TextWithAttachments
            text={item.text || item.description}
            attachments={attachments}
            onDeleteAttachment={onDeleteAttachment || (async () => {})}
            canEdit={canEdit}
            highlight={highlight}
          />
          {/* 작성자/마감일 표시 */}
          <div className="text-xs text-gray-500 mt-1 flex gap-2">
            {item.author ? <span>담당: {item.author}</span> : null}
            {item.dueDate ? <span>등록일자: {item.dueDate.slice(0, 10)}</span> : null}
          </div>
        </div>
      )}
    </li>
  );
};

export default ChecklistItemComponent; 