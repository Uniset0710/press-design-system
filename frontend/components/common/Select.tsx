import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  fullWidth?: boolean;
  // 접근성 속성 추가
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  fullWidth = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}) => {
  const baseClasses = 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  const invalidClasses = ariaInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${disabledClasses} ${invalidClasses} ${widthClasses} ${className}`;
  
  return (
    <select
      value={value}
      onChange={onChange}
      className={classes}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select; 