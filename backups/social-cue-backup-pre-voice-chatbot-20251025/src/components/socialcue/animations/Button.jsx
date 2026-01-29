import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false, 
  variant = 'primary',
  size = 'md',
  className = '',
  darkMode = false,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  // Base styles
  const baseStyles = `
    relative inline-flex items-center justify-center font-medium transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${isPressed ? 'scale-95' : 'scale-100'}
    ${disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
  `;

  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-xl',
    xl: 'px-8 py-5 text-xl rounded-2xl'
  };

  // Color variants
  const variantStyles = {
    primary: darkMode 
      ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500' 
      : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: darkMode 
      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 focus:ring-white/50' 
      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 focus:ring-gray-500',
    success: darkMode 
      ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500' 
      : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: darkMode 
      ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' 
      : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: darkMode 
      ? 'bg-transparent hover:bg-white/10 text-white focus:ring-white/50' 
      : 'bg-transparent hover:bg-gray-100 text-gray-900 focus:ring-gray-500'
  };

  const buttonClasses = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `.trim();

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      <span className={loading ? 'opacity-75' : ''}>
        {children}
      </span>
    </button>
  );
};

export default Button;
