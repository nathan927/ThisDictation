import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CameraUploadProps {
  onCapture: (file: File) => void;
}

const CameraUpload: React.FC<CameraUploadProps> = ({ onCapture }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert(t('Failed to access camera. Please check permissions.'));
    }
  };

  const takePhoto = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            onCapture(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="mt-4">
      <video 
        ref={videoRef} 
        className="w-full h-auto max-w-md mx-auto mb-4 rounded-lg" 
        style={{ 
          display: isStreaming ? 'block' : 'none'
        }} 
        playsInline 
        autoPlay
      />
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
