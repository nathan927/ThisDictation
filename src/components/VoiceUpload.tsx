import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { transcribeAudio } from '../services/api';

interface VoiceUploadProps {
  onConfirm: (words: string[]) => void;
  onClose: () => void;
}

const VoiceUpload: React.FC<VoiceUploadProps> = ({ onConfirm, onClose: handleClose }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [recordingName, setRecordingName] = useState('');

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setAudioBlob(blob);
          try {
            const text = await transcribeAudio(blob);
            setTranscribedText(text);
          } catch (error) {
            console.error('Transcription failed:', error);
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    }
  };

  const handleCancel = () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setAudioBlob(null);
    setTranscribedText('');
    setRecordingName('');
  };

  const handleConfirm = () => {
    if (transcribedText.trim()) {
      // Split the text into lines and only use the text content
      const words = transcribedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Pass only the text array to onConfirm
      onConfirm(words);
      handleClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <button
          onClick={toggleRecording}
          className={`px-4 py-2 rounded ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isRecording ? t('Stop Recording') : t('Start Recording')}
        </button>
        <button
          onClick={handleCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          {t('Cancel')}
        </button>
      </div>

      {audioBlob && !isRecording && (
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              placeholder={t('Enter recording name')}
              className="w-full p-2 border rounded"
            />
          </div>
          <textarea
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            placeholder={t('You can edit the transcribed text here or directly input the words you said')}
            className="w-full h-32 p-2 border rounded"
          />
        </div>
      )}
    </div>
  );
};

export default VoiceUpload; 