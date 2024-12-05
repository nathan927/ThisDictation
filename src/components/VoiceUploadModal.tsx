import React, { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';

interface VoiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceUploadModal: React.FC<VoiceUploadModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const { settings, setWordSets, setSettings } = useDictation();
  const [wordSetInput, setWordSetInput] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({ audio: true });

  const isRecording = status === 'recording';

  const getLanguageCode = (language: string) => {
    switch (language) {
      case 'Cantonese':
        return 'zh-HK';
      case 'Mandarin':
        return 'zh-CN';
      default:
        return 'en-US';
    }
  };

  const startRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getLanguageCode(settings.pronunciation);

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setWordSetInput(prev => {
          const lines = prev.split('\n');
          lines[lines.length - 1] = transcript;
          return lines.join('\n');
        });
      };

      recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        setRecognitionError(`Recognition error: ${event.error}`);
        setIsRecognizing(false);
      };

      recognition.onend = () => {
        setIsRecognizing(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecognizing(true);
      setRecognitionError('');
    } catch (error) {
      console.error('Error starting recognition:', error);
      setRecognitionError(error instanceof Error ? error.message : 'Failed to start recognition');
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecognizing(false);
  };

  const handleRecordingToggle = async () => {
    if (isRecording) {
      stopRecording();
      stopRecognition();
    } else {
      setWordSetInput('');
      setRecognitionError('');
      startRecording();
      startRecognition();
    }
  };

  const handleClose = () => {
    stopRecognition();
    clearBlobUrl();
    setWordSetInput('');
    setRecognitionError('');
    onClose();
  };

  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        stopRecognition();
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white p-6">
          <Dialog.Title className="text-xl font-medium mb-4 text-center">
            {t('Voice Upload')}
          </Dialog.Title>
          
          {recognitionError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {recognitionError}
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            {mediaBlobUrl && !isRecording ? (
              <>
                <audio src={mediaBlobUrl} controls className="w-full mb-4" />
                <div className="flex gap-3">
                  <textarea
                    value={wordSetInput}
                    onChange={(e) => setWordSetInput(e.target.value)}
                    placeholder={t('Enter words to practice (one per line)')}
                    className="flex-1 border rounded-lg p-3 h-32 text-base resize-none"
                  />
                </div>

                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => {
                      clearBlobUrl();
                      setWordSetInput('');
                      setRecognitionError('');
                    }}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-base font-medium"
                  >
                    {t('Record Again')}
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-base font-medium"
                    >
                      {t('Cancel')}
                    </button>
                    {wordSetInput.trim() && (
                      <button
                        onClick={() => {
                          const words = wordSetInput
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line.length > 0);
                          setWordSets(prevWords => [...prevWords, ...words.map(text => ({ text }))]);
                          handleClose();
                        }}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-base font-medium"
                      >
                        {t('Confirm')}
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                {isRecording ? (
                  <button
                    onClick={handleRecordingToggle}
                    className="w-full py-4 rounded-lg text-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    {t('Stop Recording')}
                  </button>
                ) : (
                  <button
                    onClick={handleRecordingToggle}
                    className="w-full py-4 rounded-lg text-xl font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    {t('Start Recording')}
                  </button>
                )}
                
                {!isRecording && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('Pronunciation')}
                      </label>
                      <select
                        value={settings.pronunciation}
                        onChange={(e) => setSettings({ ...settings, pronunciation: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="Cantonese">{t('Cantonese')}</option>
                        <option value="Mandarin">{t('Mandarin')}</option>
                        <option value="English">{t('English')}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VoiceUploadModal;