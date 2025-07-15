import React from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'date' | 'number';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  min?: string | number;
  max?: string | number;
  fullWidth?: boolean;
  // 접근성 속성 추가
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  min,
  max,
  fullWidth = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  autoComplete,
  ...props
}) => {
  const baseClasses = 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  const invalidClasses = ariaInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${disabledClasses} ${invalidClasses} ${widthClasses} ${className}`;
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={classes}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
      min={min}
      max={max}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      autoComplete={autoComplete}
      {...props}
    />
  );
};

export default Input; 