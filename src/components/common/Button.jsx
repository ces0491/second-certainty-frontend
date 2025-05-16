// src/components/common/Button.jsx
import React from 'react';

// Button variants
const VARIANTS = {
  primary: 'bg-sc-green hover:bg-sc-green-700 text-white',
  secondary: 'bg-white text-sc-green border border-sc-green hover:bg-sc-green/10',
  accent: 'bg-sc-gold hover:bg-sc-gold/80 text-sc-black',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  gray: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
};

// Button sizes
const SIZES = {
  sm: 'py-1 px-2 text-sm',
  md: 'py-2 px-4',
  lg: 'py-3 px-6 text-lg'
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  type = 'button',
  disabled = false,
  onClick,
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green
        transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;