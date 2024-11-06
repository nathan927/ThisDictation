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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  
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

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Prefer rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      // Show user-friendly error message
      alert(t('Failed to access camera. Please check permissions.'));
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          processImage(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
        }
      }, 'image/jpeg');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleClose = () => {
    stopCamera();
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
        .filter(word => word.length > 0);
      
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
                <div className="text-center text-gray-500">- {t('or')} -</div>
                {!showCamera ? (
                  <button
                    onClick={startCamera}
                    className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {t('Open Camera')}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <video
                      ref={videoRef}
                      className="w-full h-auto"
                      autoPlay
                      playsInline
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={takePhoto}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        {t('Take Photo')}
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        {t('Cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedImage && !showCamera && (
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