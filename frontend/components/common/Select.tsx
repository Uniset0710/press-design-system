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
}) => {
  const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  
  const classes = `${baseClasses} ${disabledClasses} ${className}`;
  
  return (
    <select
      value={value}
      onChange={onChange}
      className={classes}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
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