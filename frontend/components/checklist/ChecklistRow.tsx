import React from 'react';
import { ChecklistItem } from '@/app/types/checklist';

interface ChecklistRowProps {
  item: ChecklistItem;
  onClick: () => void;
}

const ChecklistRow: React.FC<ChecklistRowProps> = ({ item, onClick }) => {
  return (
    <tr className='bg-white cursor-pointer hover:bg-blue-50' onClick={onClick}>
      <td className='border px-2 py-1'>{item.text || item.description}</td>
      <td className='border px-2 py-1 whitespace-nowrap text-center min-w-[100px] w-[100px] max-w-[120px]'>
        {item.author || '-'}
      </td>
      <td className='border px-2 py-1 whitespace-nowrap text-center min-w-[120px] w-[120px] max-w-[140px]'>
        {item.dueDate ? item.dueDate.slice(0, 10) : '-'}
      </td>
      <td className='border px-2 py-1 whitespace-nowrap text-center min-w-[80px] w-[80px] max-w-[100px]'>
        {(item as any).category || '-'}
      </td>
      <td className='border px-2 py-1 whitespace-nowrap text-center min-w-[80px] w-[80px] max-w-[100px]'>
        {(item as any).priority || '-'}
      </td>
      <td className='border px-2 py-1 whitespace-nowrap text-center min-w-[60px] w-[60px] max-w-[80px]'>
        {item.attachments && item.attachments.length > 0 ? (
          <span title='첨부파일 있음'>📎 {item.attachments.length}</span>
        ) : (
          '-'
        )}
      </td>
    </tr>
  );
};

export default ChecklistRow;
