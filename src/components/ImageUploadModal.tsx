import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { performOCR, OCRError } from '../services/api';
import { useDictation } from '../context/DictationContext';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t, i18n } = useTranslation();
  const { setWordSets } = useDictation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set default language based on current UI language
  const getDefaultLanguage = () => {
    switch (i18n.language) {
      case 'zh-TW':
        return 'cht';
      case 'zh-CN':
        return 'chs';
      default:
        return 'eng';
    }
  };
  
  const [selectedLanguage, setSelectedLanguage] = useState(getDefaultLanguage());

  // Add this useEffect to update language when UI language changes
  useEffect(() => {
    setSelectedLanguage(getDefaultLanguage());
  }, [i18n.language]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setError(null);
    setRecognizedText('');
    setIsProcessing(true);
    setSelectedImage(file);

    try {
      const text = await performOCR(file, selectedLanguage);
      if (!text) {
        throw new Error('No text was recognized');
      }
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

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    
    if (!selectedImage) return;

    // Reset previous state
    setError(null);
    setRecognizedText('');
    setIsProcessing(true);

    try {
      const text = await performOCR(selectedImage, newLanguage);
      if (!text) {
        throw new Error('No text was recognized');
      }
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

  const handleClose = () => {
    setSelectedImage(null);
    setRecognizedText('');
    setError(null);
    setSelectedLanguage(getDefaultLanguage()); // Reset to default based on UI language
    onClose();
  };

  const handleConfirm = () => {
    if (recognizedText.trim()) {
      const newWords = recognizedText
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .map(word => ({ text: word }));
      
      setWordSets(prevWords => [...prevWords, ...newWords]);
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-md rounded bg-white p-4 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-medium mb-4 sticky top-0 bg-white pb-2 border-b">
            {t('Image Upload')}
          </Dialog.Title>

          <div className="space-y-4 mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium text-gray-700 min-w-[120px]">
                {t('Document Language')}:
              </label>
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="flex-1 p-2 border rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="eng">{t('English')}</option>
                <option value="cht">{t('Traditional Chinese')}</option>
                <option value="chs">{t('Simplified Chinese')}</option>
              </select>
            </div>

            {/* Camera capture input */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
              id="cameraInput"
            />
            <label
              htmlFor="cameraInput"
              className="block w-full px-4 py-2 text-center bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
            >
              {t('Take Photo')}
            </label>

            {/* File selection input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="block w-full px-4 py-2 text-center bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600"
            >
              {t('Select a file')}
            </label>

            {selectedImage && (
              <div className="max-h-[40vh] overflow-y-auto">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="max-w-full h-auto"
                />
              </div>
            )}

            {isProcessing && (
              <div className="text-center text-gray-600">
                {t('Processing...')}
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
                placeholder={t('Recognized text will appear here...')}
              />
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <div className="flex justify-end gap-2 max-w-md mx-auto">
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