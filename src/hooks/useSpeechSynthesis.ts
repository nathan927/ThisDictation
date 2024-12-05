import { useCallback, useEffect, useRef, useState } from 'react';
import { useDictation } from '../context/DictationContext';

interface SpeakOptions {
  rate?: number;
  interval?: number;
}

export const useSpeechSynthesis = () => {
  const { settings } = useDictation();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthesisRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load and update voices when available
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synthesisRef.current.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    synthesisRef.current.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      synthesisRef.current.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Get appropriate voice based on language
  const getVoice = useCallback((language: string) => {
    const languageCode = language.toLowerCase();
    return voices.find(voice => 
      voice.lang.toLowerCase().startsWith(languageCode) ||
      voice.lang.toLowerCase() === languageCode
    ) || voices.find(voice => voice.default) || voices[0];
  }, [voices]);

  const getLanguageCode = useCallback((pronunciation: string) => {
    return pronunciation.split('-')[0];
  }, []);

  const stop = useCallback(() => {
    synthesisRef.current.cancel();
    if (utteranceRef.current) {
      utteranceRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text: string, options: SpeakOptions = {}) => {
    return new Promise<void>((resolve, reject) => {
      try {
        stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Configure utterance
        utterance.voice = getVoice(settings.pronunciation);
        utterance.rate = options.rate || 1;
        utterance.lang = getLanguageCode(settings.pronunciation);

        // Handle events
        utterance.onend = () => {
          utteranceRef.current = null;
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          utteranceRef.current = null;
          reject(new Error('Speech synthesis failed'));
        };

        synthesisRef.current.speak(utterance);

        // Workaround for some browsers that might not trigger onend
        const maxTimeout = (text.length * 100) + 1000; // Rough estimate
        setTimeout(() => {
          if (utteranceRef.current === utterance) {
            utteranceRef.current = null;
            resolve();
          }
        }, maxTimeout);

      } catch (error) {
        console.error('Speech synthesis setup error:', error);
        reject(error);
      }
    });
  }, [getVoice, getLanguageCode, settings.pronunciation, stop]);

  return {
    speak,
    stop,
    voices,
    isSupported: 'speechSynthesis' in window
  };
};