import React, { useState } from 'react';
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
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">{t('Image Upload')}</Dialog.Title>
          
          <div className="space-y-4">
            <CameraUpload onCapture={handleFileSelect} />
            <div className="text-center text-gray-500">{t('or')}</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="w-full"
            />
          </div>

          {isProcessing && <div className="mt-4">Processing...</div>}
          {error && <div className="mt-4 text-red-500">{error}</div>}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImageUploadModal;