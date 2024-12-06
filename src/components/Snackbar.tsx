import React, { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

const Snackbar: React.FC<SnackbarProps> = ({
  message,
  isOpen,
  onClose,
  duration = 2000
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isOpen
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-4 py-3 flex items-center space-x-2 backdrop-blur-sm bg-opacity-90">
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Snackbar;
