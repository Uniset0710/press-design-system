import React, { useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import { AttachmentData, ChecklistItem, ChecklistData } from '@/app/types/checklist';
import { uploadAttachment } from '@/lib/uploadAttachment';

interface ChecklistAttachmentsProps {
  item: ChecklistItem;
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistData>>;
  onDelete?: (attachmentId: string) => Promise<void>;
}

const isImageFile = (mimeType: string) => mimeType.startsWith('image/');

const AttachmentItem = memo(({ 
  attachment, 
  onDelete,
  disabled 
}: { 
  attachment: AttachmentData;
  onDelete?: () => Promise<void>;
  disabled?: boolean;
}) => {
  const isImage = isImageFile(attachment.mimeType);

  return (
    <div className="relative group border rounded p-2 hover:bg-gray-50">
      {isImage ? (
        <div className="relative w-32 h-32">
          <Image
            src={attachment.url}
            alt={attachment.filename}
            fill
            className="object-cover rounded"
            sizes="128px"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <span className="text-sm truncate">{attachment.filename}</span>
        </div>
      )}
      
      {onDelete && !disabled && !attachment.isTemp && (
        <button
          onClick={onDelete}
          className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="삭제"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {attachment.isTemp && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
        </div>
      )}
    </div>
  );
});

AttachmentItem.displayName = 'AttachmentItem';

export const ChecklistAttachments = memo(function ChecklistAttachments({
  item,
  setChecklist,
  onDelete,
}: ChecklistAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAttachment(file, item, setChecklist);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [item, setChecklist]);

  const handleDelete = useCallback(async (attachmentId: string) => {
    if (!onDelete) return;
    
    try {
      await onDelete(attachmentId);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('파일 삭제에 실패했습니다.');
    }
  }, [onDelete]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {item.attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            onDelete={onDelete ? () => handleDelete(attachment.id) : undefined}
            disabled={item.attachments.some(a => a.isTemp)}
          />
        ))}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          disabled={item.attachments.some(a => a.isTemp)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={item.attachments.some(a => a.isTemp)}
        >
          파일 첨부
        </button>
      </div>
    </div>
  );
}); 