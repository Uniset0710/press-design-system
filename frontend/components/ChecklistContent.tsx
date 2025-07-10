"use client";
import React, { useState, useEffect } from 'react';

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
        <textarea
          value={editText}
          onChange={handleTextChange}
          className="w-full p-2 border rounded"
          rows={3}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            저장
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            취소
          </button>
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