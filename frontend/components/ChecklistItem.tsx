import React, { memo } from 'react';
import { ChecklistItem as ChecklistItemType, ChecklistData } from '@/types/checklist';
import { ChecklistAttachments } from './ChecklistAttachments';

interface ChecklistItemProps {
  item: ChecklistItemType;
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistData>>;
  onDelete?: (attachmentId: string) => Promise<void>;
}

export const ChecklistItem = memo(function ChecklistItem({
  item,
  setChecklist,
  onDelete,
}: ChecklistItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium">{item.text}</h3>
          {item.description && (
            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
          )}
        </div>
      </div>

      <ChecklistAttachments
        item={item}
        setChecklist={setChecklist}
        onDelete={onDelete}
      />
    </div>
  );
}); 