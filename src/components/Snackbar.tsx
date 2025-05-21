import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error'; // New prop
  isError?: boolean; // Prop from previous step, will be mapped to 'type'
}

const Snackbar: React.FC<SnackbarProps> = ({
  message,
  isOpen,
  onClose,
  duration = 3000, // Adjusted default duration as per conceptual example
  type: explicitType, // Renamed to avoid conflict with derived type
  isError, // Prop from previous step
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  // Determine type: prioritize explicit 'type' prop, then 'isError', default to 'success'
  let currentType: 'success' | 'error' = 'success';
  if (explicitType) {
    currentType = explicitType;
  } else if (isError !== undefined) { // Check if isError is explicitly passed
    currentType = isError ? 'error' : 'success';
  }
  
  const isErrorType = currentType === 'error';
  const bgColor = isErrorType
    ? 'bg-gradient-to-r from-red-400 to-red-500'
    : 'bg-gradient-to-r from-green-400 to-emerald-500';
  const IconComponent = isErrorType ? XCircleIcon : CheckCircleIcon;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        isOpen
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className={`${bgColor} shadow-md rounded-lg px-4 py-2 flex items-center space-x-2 backdrop-blur-md bg-opacity-90 border border-white/20`}>
        <IconComponent className="h-5 w-5 text-white" />
        <span className="text-white font-medium tracking-normal">{message}</span>
      </div>
    </div>
  );
};

export default Snackbar;
