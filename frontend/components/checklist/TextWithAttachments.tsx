import React from 'react';
import { AttachmentData } from '@/app/types/checklist';
import { FaFilePdf, FaFileExcel, FaFileImage, FaFileAlt } from 'react-icons/fa';

interface TextWithAttachmentsProps {
  text: string;
  attachments?: AttachmentData[];
  onDeleteAttachment: (attachmentId: string) => Promise<void>;
  canEdit?: boolean;
  highlight?: string;
}

const TextWithAttachments: React.FC<TextWithAttachmentsProps> = ({
  text,
  attachments = [],
  onDeleteAttachment,
  canEdit = false,
  highlight = '',
}) => {
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);

  const handleDelete = async (attachmentId: string) => {
    if (window.confirm('첨부파일을 정말 삭제하시겠습니까?')) {
      await onDeleteAttachment(attachmentId);
    }
  };

  // 하이라이트 함수
  function highlightText(str: string, keyword: string) {
    if (!keyword) return str;
    const regex = new RegExp(
      `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );
    return str.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className='bg-yellow-200 px-0.5 rounded'>
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='text-gray-900'>{highlightText(text, highlight)}</div>
      {attachments.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {attachments.map(att => {
            const src = att.uri || att.url || '';
            const isImage = att.mimeType?.startsWith('image/');
            const isPdf =
              att.mimeType === 'application/pdf' ||
              att.filename.match(/\.pdf$/i);
            const isExcel =
              att.mimeType?.includes('excel') ||
              att.filename.match(/\.(xls|xlsx)$/i);

            let icon = <FaFileAlt size={32} />;
            if (isImage) icon = <FaFileImage size={32} />;
            else if (isPdf) icon = <FaFilePdf size={32} color='#d32f2f' />;
            else if (isExcel) icon = <FaFileExcel size={32} color='#388e3c' />;

            if (isImage) {
              return (
                <div key={att.id} className='relative group'>
                  <img
                    src={src}
                    alt={att.filename}
                    className='w-16 h-16 object-cover rounded border cursor-pointer'
                    onClick={() => setPreviewSrc(src)}
                  />
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(att.id)}
                      className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100'
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            } else if (isPdf) {
              return (
                <div key={att.id} className='relative group'>
                  <a href={src} download={att.filename} title='PDF 다운로드'>
                    <div className='w-16 h-16 flex flex-col items-center justify-center border rounded bg-gray-50 cursor-pointer'>
                      {icon}
                      <span className='block text-xs truncate w-16'>
                        {att.filename}
                      </span>
                    </div>
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(att.id)}
                      className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100'
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            } else if (isExcel) {
              return (
                <div key={att.id} className='relative group'>
                  <a href={src} download={att.filename} title='엑셀 다운로드'>
                    <div className='w-16 h-16 flex flex-col items-center justify-center border rounded bg-gray-50 cursor-pointer'>
                      {icon}
                      <span className='block text-xs truncate w-16'>
                        {att.filename}
                      </span>
                    </div>
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(att.id)}
                      className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100'
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            } else {
              return (
                <div key={att.id} className='relative group'>
                  <a href={src} download={att.filename} title='파일 다운로드'>
                    <div className='w-16 h-16 flex flex-col items-center justify-center border rounded bg-gray-50 cursor-pointer'>
                      {icon}
                      <span className='block text-xs truncate w-16'>
                        {att.filename}
                      </span>
                    </div>
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(att.id)}
                      className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100'
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            }
          })}
        </div>
      )}
      {previewSrc && (
        <div
          className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
          onClick={() => setPreviewSrc(null)}
        >
          <img
            src={previewSrc}
            alt='preview'
            className='max-w-3xl max-h-full rounded shadow-lg'
          />
        </div>
      )}
    </div>
  );
};

export default TextWithAttachments;
