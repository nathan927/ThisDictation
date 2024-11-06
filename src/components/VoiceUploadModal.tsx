import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { useTranslation } from 'react-i18next';
import { transcribeAudio } from '../services/api';
import { useDictation } from '../context/DictationContext';

interface VoiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (text: string, audioUrl: string) => void;
}

interface Word {
  text: string;
  audioUrl?: string;
}

const VoiceUploadModal: React.FC<VoiceUploadModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { t } = useTranslation();
  const [wordSetInput, setWordSetInput] = useState('');
  const { setWordSets } = useDictation();

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({ audio: true });

  const isRecording = status === 'recording';

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleClose = () => {
    clearBlobUrl();
    setWordSetInput('');
    onClose();
  };

  const handleConfirm = (text: string, audioUrl: string) => {
    setWordSets(prevWords => [...prevWords, { text, audioUrl }]);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <button
                onClick={handleRecordingToggle}
                className={`w-full px-4 py-2 rounded ${
                  isRecording ? 'bg-red-500' : 'bg-blue-500'
                } text-white`}
              >
                {isRecording ? t('Stop Recording') : t('Start Recording')}
              </button>
            </div>

            {mediaBlobUrl && !isRecording && (
              <>
                <audio src={mediaBlobUrl} controls className="w-full" />
                <textarea
                  value={wordSetInput}
                  onChange={(e) => setWordSetInput(e.target.value)}
                  placeholder={t('Enter the words you want to practice (one per line)')}
                  className="w-full border rounded p-2 h-32"
                />
              </>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                {t('Cancel')}
              </button>
              {wordSetInput.trim() && (
                <button
                  onClick={() => handleConfirm(wordSetInput.trim(), mediaBlobUrl)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {t('Confirm')}
                </button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VoiceUploadModal;