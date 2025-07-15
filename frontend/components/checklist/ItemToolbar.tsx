import React from 'react';

interface ItemToolbarProps {
  onStartEdit: () => void;
  onDelete: () => void;
  onAttach: (file: File) => Promise<void>;
  isAdmin?: boolean;
}

const ItemToolbar: React.FC<ItemToolbarProps> = ({
  onStartEdit,
  onDelete,
  onAttach,
  isAdmin,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAttach(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className='flex gap-2 mb-2'>
      {isAdmin && (
        <>
          <button
            onClick={onStartEdit}
            className='text-blue-500 hover:text-blue-700'
          >
            수정
          </button>
          <button onClick={onDelete} className='text-red-500 hover:text-red-700'>
            삭제
          </button>
        </>
      )}
      <input
        ref={fileInputRef}
        type='file'
        onChange={handleFileChange}
        className='hidden'
        accept='image/*,.pdf,.doc,.docx,.xls,.xlsx'
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className='text-green-500 hover:text-green-700'
      >
        첨부
      </button>
    </div>
  );
};

export default ItemToolbar;
