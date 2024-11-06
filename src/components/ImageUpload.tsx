import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CameraUpload from './CameraUpload';
import { performOCR } from '../services/api';

const ImageUpload: React.FC<{ onUpload: (text: string) => void }> = ({ onUpload }) => {
  const { t } = useTranslation();
  const [showCamera, setShowCamera] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      
      const text = await performOCR(file);
      onUpload(text);
    } catch (error) {
      console.error('Error processing image:', error);
      alert(t('Failed to process image. Please try again.'));
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCameraCapture = (file: File) => {
    handleFileUpload(file);
    setShowCamera(false);
  };

  return (
    <div className="space-y-4">
      {previewUrl && (
        <div className="relative w-full aspect-video">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <div className="text-center">
        <span className="text-gray-500">{t('or')}</span>
      </div>
      <CameraUpload onCapture={handleCameraCapture} />
    </div>
  );
};

export default ImageUpload; 