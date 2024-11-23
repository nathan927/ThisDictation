import { useCallback, useRef, useEffect, useState } from 'react';
import { useDictation } from '../context/DictationContext';

interface SpeechOptions {
  rate: number;
  interval: number;
}

// Single source of truth for language mapping
const LANGUAGE_MAP = {
  'English': 'en-US',
  'Cantonese': 'zh-HK', 
  'Mandarin': 'zh-CN'
} as const;

export const useSpeechSynthesis = () => {
  const { settings } = useDictation();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Load voices and handle browser differences
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Select appropriate voice with fallbacks
  const getVoiceForLanguage = useCallback((pronunciation: string) => {
    if (!voicesLoaded || voices.length === 0) return null;

    const langCode = LANGUAGE_MAP[pronunciation as keyof typeof LANGUAGE_MAP];
    
    // Try to find exact match
    let voice = voices.find(v => v.lang === langCode);
    
    // Fallback to partial match
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    }
    
    // Final fallback to any voice
    return voice || voices[0];
  }, [voices, voicesLoaded]);

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

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const speak = useCallback(async (text: string, options: SpeechOptions): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        cleanup();

        // Wait for voices to load if needed
        if (!voicesLoaded) {
          console.warn('Voices not loaded yet, waiting...');
          setTimeout(() => speak(text, options).then(resolve).catch(reject), 100);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        utterance.rate = options.rate;
        utterance.volume = 1;
        utterance.pitch = 1;

        // Get appropriate voice
        const voice = getVoiceForLanguage(settings.pronunciation);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          console.warn('No suitable voice found, using default');
        }

        // Handle events
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
    });
  }, [cleanup, getVoiceForLanguage, settings.pronunciation, voicesLoaded]);

  return {
    speak,
    stop: cleanup,
    voicesLoaded
  };
};