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
  const [usingSpeechInput, setUsingSpeechInput] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentRecognition = useRef<any>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({ audio: true });

  const isRecording = status === 'recording';

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

  const startMobileSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setRecognitionError(t('Speech recognition is not supported in this browser'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLanguageCode(settings.pronunciation);

      // Disable start and end sounds for mobile
      if (isMobile) {
        // @ts-ignore - This property exists but is not in the type definitions
        recognition.soundstart = false;
        // @ts-ignore
        recognition.soundend = false;
        // @ts-ignore
        recognition.startSound = false;
        // @ts-ignore
        recognition.endSound = false;
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setWordSetInput(prev => prev + (prev ? '\n' : '') + transcript);
        setUsingSpeechInput(false);
      };

      recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError(t('Please allow microphone access to use speech recognition'));
        } else {
          setRecognitionError(t('Recognition error: ') + event.error);
        }
        setIsRecognizing(false);
        setUsingSpeechInput(false);
      };

      recognition.onend = () => {
        setIsRecognizing(false);
        setUsingSpeechInput(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecognizing(true);
      setRecognitionError('');
    } catch (error) {
      console.error('Error starting recognition:', error);
      setRecognitionError(error instanceof Error ? error.message : t('Failed to start recognition'));
      setUsingSpeechInput(false);
    }
  };

  const startRecognition = () => {
    if (!isMobile && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = ''; // Empty string enables auto-detection
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setUsingSpeechInput(true);
        setRecognitionError('');
      };

      recognition.onend = () => {
        if (usingSpeechInput) {
          recognition.start();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setRecognitionError(t('Speech recognition error: ') + event.error);
        setUsingSpeechInput(false);
      };

      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const transcript = result[0].transcript.trim();
          if (transcript) {
            setWordSetInput(prev => {
              const words = prev.split('\n').filter(word => word.trim());
              words.push(transcript);
              return words.join('\n');
            });
          }
        }
      };

      currentRecognition.current = recognition;
      recognition.start();
    }
  };

  const handleSpeechInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text) {
      setWordSetInput(prev => prev + (prev ? '\n' : '') + text);
    }
    setUsingSpeechInput(false);
  };

  const stopRecognition = () => {
    if (!isMobile && currentRecognition.current) {
      currentRecognition.current.stop();
      currentRecognition.current = null;
    }
    setUsingSpeechInput(false);
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

  const handleSave = async () => {
    const words = wordSetInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (words.length === 1 && mediaBlobUrl) {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setWordSets(prevWords => [...prevWords, { 
        text: words[0],
        audioUrl: audioUrl
      }]);
    } else {
      setWordSets(prevWords => [...prevWords, ...words.map(text => ({ text }))]);
    }
    handleClose();
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
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6">
          <Dialog.Title className="text-xl font-medium mb-4 text-center">
            {t('Voice Upload')}
          </Dialog.Title>
          
          {recognitionError && (
            <p className="text-red-500 text-xs mt-4 text-center">
              {recognitionError}
            </p>
          )}
          {!window.SpeechRecognition && !window.webkitSpeechRecognition && (
            <p className="text-red-500 text-xs mt-4 text-center">
              {t('Speech Recognition is not supported in this browser')}
            </p>
          )}
          
          <div className="flex flex-col gap-4">
            {isMobile ? (
              // Mobile Interface - Speech Input First
              <div className="flex flex-col gap-4">
                {mediaBlobUrl && (
                  <audio src={mediaBlobUrl} controls className="w-full mb-4" />
                )}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (usingSpeechInput) {
                        setUsingSpeechInput(false);
                        stopRecognition();
                      } else {
                        setUsingSpeechInput(true);
                        startMobileSpeechRecognition();
                      }
                    }}
                    className={`w-full py-4 rounded-lg text-xl font-medium transition-colors ${
                      usingSpeechInput
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white shadow-lg`}
                  >
                    {usingSpeechInput ? t('Stop Speech Input') : t('Start Speech Input')}
                  </button>
                </div>
                <textarea
                  value={wordSetInput}
                  onChange={(e) => setWordSetInput(e.target.value)}
                  placeholder={t('One Word Per Line. You can keep using speech input to add more words.')}
                  className="flex-1 border rounded-lg p-3 h-32 text-base resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-4 rounded-lg text-xl font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  {!usingSpeechInput && wordSetInput.trim() && (
                    <button
                      onClick={handleSave}
                      className="flex-1 py-4 rounded-lg text-xl font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
                    >
                      {t('Confirm')}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Desktop Interface - Combined View
              <div className="space-y-6">
                <button
                  onClick={() => {
                    if (isRecording || usingSpeechInput) {
                      stopRecognition();
                      setUsingSpeechInput(false);
                      handleRecordingToggle();
                    } else {
                      setUsingSpeechInput(true);
                      startRecognition();
                      handleRecordingToggle();
                    }
                  }}
                  className={`w-full py-4 rounded-lg text-xl font-medium transition-colors ${
                    isRecording || usingSpeechInput
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white shadow-lg`}
                >
                  {isRecording || usingSpeechInput ? t('Stop Recording') : t('Start Recording')}
                </button>

                {mediaBlobUrl && (
                  <audio src={mediaBlobUrl} controls className="w-full" />
                )}

                <div className="flex flex-col gap-4 mt-4">
                  <textarea
                    value={wordSetInput}
                    onChange={(e) => setWordSetInput(e.target.value)}
                    placeholder={t('Enter words to practice (one per line)')}
                    className="w-full border rounded-lg p-4 h-[40rem] text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-base font-medium shadow-md"
                  >
                    {t('Cancel')}
                  </button>
                  {wordSetInput.trim() && (
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-base font-medium shadow-md"
                    >
                      {t('Confirm')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VoiceUploadModal;