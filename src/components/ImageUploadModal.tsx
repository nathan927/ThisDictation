import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { performOCR, OCRError } from '../services/api';
import { useDictation } from '../context/DictationContext';
import CameraUpload from './CameraUpload';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsProcessing(true);
    
    try {
      const text = await performOCR(file);
      onConfirm(text);
      onClose();
    } catch (err) {
      setError(err instanceof OCRError ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="text-center">
              <span className="text-gray-500">- {t('or')} -</span>
            </div>
            <CameraUpload onCapture={handleFileSelect} />
            {isProcessing && <div className="text-center">Processing...</div>}
            {error && <div className="text-red-500">{error}</div>}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ImageUploadModal;