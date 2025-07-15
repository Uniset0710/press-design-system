"use client";
import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Textarea from './common/Textarea';

interface ChecklistContentProps {
  text: string;
  author?: string;
  createdAt?: string;
  isEditing: boolean;
  onTextChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ChecklistContent: React.FC<ChecklistContentProps> = ({
  text,
  author,
  createdAt,
  isEditing,
  onTextChange,
  onSave,
  onCancel,
}) => {
  const [editText, setEditText] = useState(text);

  useEffect(() => {
    if (isEditing) {
      setEditText(text);
    }
  }, [isEditing, text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditText(newText);
    onTextChange(newText);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          value={editText}
          onChange={handleTextChange}
          rows={3}
          autoFocus
          aria-label="체크리스트 내용 편집"
          aria-describedby="checklist-content-description"
        />
        <div id="checklist-content-description" className="sr-only">
          체크리스트 내용을 편집할 수 있습니다. 저장 버튼을 눌러 변경사항을 저장하거나 취소 버튼을 눌러 편집을 취소할 수 있습니다.
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            variant="primary"
            aria-label="변경사항 저장"
          >
            저장
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            aria-label="편집 취소"
          >
            취소
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="whitespace-pre-wrap">{text}</p>
      {(author || createdAt) && (
        <p className="text-sm text-gray-500">
          {author && <span>{author}</span>}
          {author && createdAt && <span> · </span>}
          {createdAt && <span>{createdAt}</span>}
        </p>
      )}
    </div>
  );
};

export default ChecklistContent; 