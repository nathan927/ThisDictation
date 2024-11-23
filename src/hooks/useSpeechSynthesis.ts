import { useCallback, useRef, useEffect, useState } from 'react';
import { useDictation } from '../context/DictationContext';

interface SpeechOptions {
  rate: number;
  interval: number;
}

export const useSpeechSynthesis = () => {
  const { settings } = useDictation();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const getVoiceForLanguage = useCallback((pronunciation: string) => {
    const languageMap: { [key: string]: string } = {
      'English': 'en-US',
      'Cantonese': 'zh-HK',
      'Mandarin': 'zh-CN'
    };

    const langCode = languageMap[pronunciation];
    return voices.find(voice => voice.lang.startsWith(langCode)) || voices[0];
  }, [voices]);

  const cleanup = useCallback(() => {
    if (speechRef.current) {
      speechSynthesis.cancel();
      speechRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const speak = useCallback((text: string, options: SpeechOptions): Promise<void> => {
    return new Promise((resolve) => {
      cleanup();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply all settings
      utterance.rate = options.rate;
      utterance.voice = getVoiceForLanguage(settings.pronunciation);
      
      // Set language based on pronunciation
      const languageMap: { [key: string]: string } = {
        'English': 'en-US',
        'Cantonese': 'zh-HK',
        'Mandarin': 'zh-CN'
      };
      utterance.lang = languageMap[settings.pronunciation];

      utterance.onend = () => {
        timeoutRef.current = setTimeout(() => {
          cleanup();
          resolve();
        }, options.interval * 1000);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        cleanup();
        resolve();
      };

      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    });
  }, [cleanup, getVoiceForLanguage, settings.pronunciation]);

  return {
    speak,
    stop: cleanup
  };
};