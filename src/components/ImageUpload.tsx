import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { performOCR } from '../services/api';

const ImageUpload: React.FC<{ onUpload: (text: string) => void }> = ({ onUpload }) => {
  const { t, i18n } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      
      const text = await performOCR(file, i18n.language);
      onUpload(text);
    } catch (error) {
      console.error('Error processing image:', error);
      alert(t('Failed to process image. Please try again.'));
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
    </div>
  );
};

export default ImageUpload; 