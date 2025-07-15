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
  fullWidth?: boolean;
  // 접근성 속성 추가
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
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
  fullWidth = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...props
}) => {
  const baseClasses = 'p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-colors text-sm sm:text-base';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  const invalidClasses = ariaInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${disabledClasses} ${invalidClasses} ${widthClasses} ${className}`;
  
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
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      {...props}
    />
  );
};

export default Textarea; 