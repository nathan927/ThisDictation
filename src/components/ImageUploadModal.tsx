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
  const { t, i18n } = useTranslation();
  const { setWordSets } = useDictation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const getDefaultLanguage = () => {
    switch (i18n.language) {
      case 'zh-TW': return 'cht';
      case 'zh-CN': return 'chs';
      default: return 'eng';
    }
  };
  
  const [selectedLanguage, setSelectedLanguage] = useState(getDefaultLanguage());

  useEffect(() => {
    setSelectedLanguage(getDefaultLanguage());
  }, [i18n.language]);

  const processImage = async (file: File) => {
    setError(null);
    setRecognizedText('');
    setIsProcessing(true);
    setSelectedImage(file);

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      const text = await performOCR(file, selectedLanguage);
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
    setSelectedLanguage(getDefaultLanguage());
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all h-[90vh] flex flex-col">
          <Dialog.Title className="text-lg font-medium flex-shrink-0">
            {t('Image Upload')}
          </Dialog.Title>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {previewUrl && (
              <div className="relative w-full aspect-video">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="min-w-32 text-sm font-medium text-gray-700">
                  {t('Document Language')}:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="flex-1 p-2 border rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="eng">{t('English')}</option>
                  <option value="cht">{t('Traditional Chinese')}</option>
                  <option value="chs">{t('Simplified Chinese')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>
            </div>

            {selectedImage && (
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className="max-w-full h-auto"
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
          </div>

          <div className="flex-shrink-0 pt-4 flex justify-end gap-2 border-t">
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
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImageUploadModal;