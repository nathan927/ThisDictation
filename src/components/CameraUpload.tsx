import React, { useRef, useState } from 'react';
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

  return (
    <div className="mt-4">
      <video ref={videoRef} className="w-full max-w-md mx-auto" />
      {!isStreaming ? (
        <button
          onClick={startCamera}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          {t('Open Camera')}
        </button>
      ) : (
        <button
          onClick={takePhoto}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
        >
          {t('Take Photo')}
        </button>
      )}
    </div>
  );
};

export default CameraUpload;