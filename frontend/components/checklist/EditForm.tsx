import React from 'react';
import Button from '../common/Button';
import Textarea from '../common/Textarea';

interface EditFormProps {
  text: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}

const EditForm: React.FC<EditFormProps> = ({
  text: initialText,
  onSave,
  onCancel,
}) => {
  const [editText, setEditText] = React.useState(initialText);

  return (
    <div className='flex flex-col gap-2'>
      <Textarea
        value={editText}
        onChange={e => setEditText(e.target.value)}
        autoFocus
      />
      <div className='flex justify-end gap-2'>
        <Button
          onClick={() => onSave(editText)}
          variant="success"
          size="sm"
        >
          저장
        </Button>
        <Button
          onClick={onCancel}
          variant="secondary"
          size="sm"
        >
          취소
        </Button>
      </div>
    </div>
  );
};

export default EditForm;
