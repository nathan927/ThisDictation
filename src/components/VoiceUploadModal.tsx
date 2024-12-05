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
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isChrome = /Chrome/i.test(navigator.userAgent);
      const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
      
      // Check for browser support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error(t('Speech recognition is not supported in this browser'));
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configure recognition settings
      recognition.continuous = false; // Set to false for better mobile compatibility
      recognition.interimResults = false; // Disable interim results on mobile
      recognition.maxAlternatives = 1;
      recognition.lang = getLanguageCode(settings.pronunciation);

      // Add specific mobile handling
      if (isMobile) {
        // Request microphone permission explicitly
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            console.log('Microphone permission granted');
          })
          .catch((err) => {
            console.error('Microphone permission error:', err);
            setRecognitionError(t('Please grant microphone permission and try again'));
            setIsRecognizing(false);
            return;
          });
      }

      let finalTranscript = '';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the input with the final transcript
        if (finalTranscript !== '') {
          setWordSetInput(prev => {
            const lines = prev.split('\n');
            lines[lines.length - 1] = finalTranscript.trim();
            return lines.join('\n');
          });
          finalTranscript = ''; // Reset for next recognition
        }
      };

      recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        let errorMessage = '';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = t('Microphone access was denied. Please allow microphone access and try again.');
            break;
          case 'no-speech':
            errorMessage = t('No speech was detected. Please try again.');
            break;
          case 'network':
            errorMessage = t('Network error occurred. Please check your internet connection.');
            break;
          default:
            errorMessage = `${t('Recognition error')}: ${event.error}`;
        }
        
        setRecognitionError(errorMessage);
        setIsRecognizing(false);
      };

      recognition.onend = () => {
        setIsRecognizing(false);
        if (recognitionRef.current) {
          // Don't auto-restart on mobile to prevent excessive battery usage
          if (!isMobile) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error('Error restarting recognition:', error);
            }
          }
        }
      };

      // Start recognition
      try {
        recognition.start();
        recognitionRef.current = recognition;
        setIsRecognizing(true);
        setRecognitionError('');
      } catch (error) {
        console.error('Error starting recognition:', error);
        setRecognitionError(t('Failed to start speech recognition. Please try again.'));
        setIsRecognizing(false);
      }

    } catch (error) {
      console.error('Speech recognition setup error:', error);
      setRecognitionError(error instanceof Error ? error.message : t('Failed to initialize speech recognition'));
      setIsRecognizing(false);
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