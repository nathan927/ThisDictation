import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CameraUploadProps {
  onCapture: (file: File) => void;
}

const CameraUpload: React.FC<CameraUploadProps> = ({ onCapture }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          onCapture(file);
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="mt-4">
      <video ref={videoRef} className="w-full max-w-md mx-auto" style={{ display: isStreaming ? 'block' : 'none' }} />
      {!isStreaming ? (
        <button
          onClick={startCamera}
          className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          {t('Open Camera')}
        </button>
      ) : (
        <button
          onClick={takePhoto}
          className="w-full px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('Take Photo')}
        </button>
      )}
    </div>
  );
};

export default CameraUpload;
