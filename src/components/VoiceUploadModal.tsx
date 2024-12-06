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
    if (isMobile) {
      startMobileSpeechRecognition();
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setRecognitionError(t('Speech recognition is not supported in this browser'));
        return;
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
        if (event.error === 'not-allowed') {
          setRecognitionError(t('Please allow microphone access to use speech recognition'));
        } else {
          setRecognitionError(t('Recognition error: ') + event.error);
        }
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
      setRecognitionError(error instanceof Error ? error.message : t('Failed to start recognition'));
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
              // Mobile Interface - Combined Recording and Speech
              <div className="flex flex-col gap-4">
                {mediaBlobUrl && (
                  <audio src={mediaBlobUrl} controls className="w-full mb-4" />
                )}
                <textarea
                  value={wordSetInput}
                  onChange={(e) => setWordSetInput(e.target.value)}
                  placeholder={t('Enter words to practice (one per line)')}
                  className="flex-1 border rounded-lg p-3 h-32 text-base resize-none"
                />
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleRecordingToggle}
                    className={`w-full py-4 rounded-lg text-xl font-medium transition-colors ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    {isRecording ? t('Stop Recording') : t('Start Recording')}
                  </button>
                  <button
                    onClick={() => {
                      if (usingSpeechInput) {
                        setUsingSpeechInput(false);
                        stopRecognition();
                      } else {
                        setUsingSpeechInput(true);
                        startRecognition();
                      }
                    }}
                    className={`w-full py-4 rounded-lg text-xl font-medium transition-colors ${
                      usingSpeechInput
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    {usingSpeechInput ? t('Stop Speech Input') : t('Start Speech Input')}
                  </button>
                </div>
                {!isRecording && !usingSpeechInput && wordSetInput.trim() && (
                  <button
                    onClick={async () => {
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
                    }}
                    className="w-full py-4 rounded-lg text-xl font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    {t('Confirm')}
                  </button>
                )}
              </div>
            ) : (
              // Desktop Interface - Unchanged
              <>
                {mediaBlobUrl && !isRecording ? (
                  <>
                    <audio src={mediaBlobUrl} controls className="w-full mb-4" />
                    <div className="flex gap-3 flex-col">
                      <textarea
                        value={wordSetInput}
                        onChange={(e) => setWordSetInput(e.target.value)}
                        placeholder={t('Enter words to practice (one per line)')}
                        className="flex-1 border rounded-lg p-3 h-32 text-base resize-none"
                      />
                      <button
                        onClick={() => {
                          if (usingSpeechInput) {
                            setUsingSpeechInput(false);
                            stopRecognition();
                          } else {
                            setUsingSpeechInput(true);
                            startRecognition();
                          }
                        }}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-base font-medium"
                      >
                        {usingSpeechInput ? t('Stop Speech Input') : t('Start Speech Input')}
                      </button>
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
                            onClick={async () => {
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
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VoiceUploadModal;