import React from 'react';

interface EditFormProps {
  text: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ text: initialText, onSave, onCancel }) => {
  const [editText, setEditText] = React.useState(initialText);

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="w-full p-2 border rounded"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => onSave(editText)}
          className="px-3 py-1 text-green-500 hover:text-green-600 border rounded"
        >
          저장
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-gray-500 hover:text-gray-600 border rounded"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default EditForm; 