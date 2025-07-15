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
}) => {
  const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  
  const classes = `${baseClasses} ${disabledClasses} ${className}`;
  
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
    />
  );
};

export default Input; 