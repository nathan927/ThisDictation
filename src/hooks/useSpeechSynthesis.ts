import { useCallback, useRef, useEffect, useState } from 'react';
import { useDictation } from '../context/DictationContext';

interface SpeechOptions {
  rate: number;
  interval: number;
}

const LANGUAGE_MAP = {
  'English': 'en-US',
  'Cantonese': 'zh-HK',
  'Mandarin': 'zh-CN'
} as const;

const MAX_RETRIES = 3;
const RETRY_DELAY = 500;

export const useSpeechSynthesis = () => {
  const { settings } = useDictation();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setVoicesLoaded(true);
      }
    };

    // Try loading voices immediately
    loadVoices();

    // Set up voice changed listener
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Cleanup
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const getVoiceForLanguage = useCallback((pronunciation: string, retryCount = 0): SpeechSynthesisVoice | null => {
    if (!voices.length && retryCount < MAX_RETRIES) {
      return null;
    }

    const langCode = LANGUAGE_MAP[pronunciation as keyof typeof LANGUAGE_MAP];
    
    // Try exact match
    let voice = voices.find(v => v.lang === langCode);
    
    // Try partial match
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    }
    
    // Fallback to any voice
    return voice || voices[0] || null;
  }, [voices]);

  const cleanup = useCallback(() => {
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const speak = useCallback(async (text: string, options: SpeechOptions): Promise<void> => {
    return new Promise((resolve, reject) => {
      const attemptSpeak = (retryCount = 0) => {
        try {
          cleanup();

          const voice = getVoiceForLanguage(settings.pronunciation, retryCount);
          
          if (!voice && retryCount < MAX_RETRIES) {
            setTimeout(() => attemptSpeak(retryCount + 1), RETRY_DELAY);
            return;
          }

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = options.rate;
          utterance.volume = 1;
          utterance.pitch = 1;

          if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
          }

          utterance.onend = () => {
            timeoutRef.current = setTimeout(() => {
              cleanup();
              resolve();
            }, options.interval * 1000);
          };

          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            cleanup();
            reject(event);
          };

          speechRef.current = utterance;
          window.speechSynthesis.speak(utterance);

        } catch (error) {
          console.error('Speech synthesis setup error:', error);
          cleanup();
          reject(error);
        }
      };

      attemptSpeak();
    });
  }, [cleanup, getVoiceForLanguage, settings.pronunciation]);

  return {
    speak,
    stop: cleanup
  };
};