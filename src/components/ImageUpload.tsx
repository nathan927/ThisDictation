import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CameraUpload from './CameraUpload';

const ImageUpload: React.FC<{ onUpload: (text: string) => void }> = ({ onUpload }) => {
  const { t } = useTranslation();
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = async (file: File) => {
    // Your existing file upload logic
  };

  const handleCameraCapture = (file: File) => {
    handleFileUpload(file);
    setShowCamera(false);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <div className="text-center">
        <span className="text-gray-500">or</span>
      </div>
      <CameraUpload onCapture={handleCameraCapture} />
    </div>
  );
};

export default ImageUpload; 