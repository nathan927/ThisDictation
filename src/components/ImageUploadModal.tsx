import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@headlessui/react';
import { useDictation } from '../context/DictationContext';
import { performOCR, OCRError } from '../services/api';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const { setWordSets } = useDictation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (file: File) => {
    setError(null);
    setRecognizedText('');
    setIsProcessing(true);
    setSelectedImage(file);

    try {
      const text = await performOCR(file);
      if (!text) throw new Error('No text was recognized');
      setRecognizedText(text);
    } catch (err) {
      const errorMessage = err instanceof OCRError 
        ? err.message 
        : t('Failed to process image. Please try again.');
      setError(errorMessage);
      setRecognizedText('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processImage(file);
  };

  const handleClose = () => {
    setSelectedImage(null);
    setRecognizedText('');
    setError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (recognizedText.trim()) {
      const newWords = recognizedText
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .map(text => ({ text }));
      
      setWordSets(prevWords => [...prevWords, ...newWords]);
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            {t('Image Upload')}
          </Dialog.Title>

          <div className="space-y-4">
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedImage && (
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className="max-w-full h-auto rounded-lg"
              />
            )}

            {isProcessing && (
              <div className="text-center text-gray-600">
                {t('Processing image...')}
              </div>
            )}

            {error && (
              <div className="text-center text-red-500">
                {error}
              </div>
            )}

            {recognizedText && (
              <textarea
                value={recognizedText}
                onChange={(e) => setRecognizedText(e.target.value)}
                className="w-full h-32 p-2 border rounded resize-none"
                placeholder={t('Recognized text will appear here')}
              />
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={handleClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!recognizedText || isProcessing}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                {t('Confirm')}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImageUploadModal;