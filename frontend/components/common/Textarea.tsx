import React from 'react';

interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  autoFocus?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  rows = 3,
  cols,
  maxLength,
  autoFocus = false,
}) => {
  const baseClasses = 'w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  
  const classes = `${baseClasses} ${disabledClasses} ${className}`;
  
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={classes}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
      rows={rows}
      cols={cols}
      maxLength={maxLength}
      autoFocus={autoFocus}
    />
  );
};

export default Textarea; 