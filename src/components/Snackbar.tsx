import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
  variant?: 'success' | 'error';
  className?: string;
}

const Snackbar: React.FC<SnackbarProps> = ({
  message,
  isOpen,
  onClose,
  duration = 2000,
  variant = 'success',
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const baseClasses = "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 whitespace-nowrap";
  const variantClasses = variant === 'success' 
    ? 'bg-green-50 text-green-800' 
    : 'bg-red-50 text-red-800';
  
  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className} ${
        isOpen
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      {variant === 'success' ? (
        <CheckCircleIcon className="h-5 w-5 text-green-600" />
      ) : (
        <XCircleIcon className="h-5 w-5 text-red-600" />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Snackbar;
