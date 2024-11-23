import { useCallback, useRef, useEffect } from 'react';

interface SpeechOptions {
  rate: number;
  interval: number;
}

export const useSpeechSynthesis = () => {
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      utterance.rate = options.rate;

      utterance.onend = () => {
        timeoutRef.current = setTimeout(() => {
          cleanup();
          resolve();
        }, options.interval * 1000);
      };

      utterance.onerror = () => {
        cleanup();
        resolve();
      };

      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    });
  }, [cleanup]);

  return {
    speak,
    stop: cleanup
  };
};