import { useCallback, useRef, useEffect } from 'react';
import { useDictation } from '../context/DictationContext';

export const useDictationPlayback = () => {
  const {
    wordSets,
    currentWordIndex,
    setCurrentWordIndex,
    isPlaying,
    setIsPlaying,
    settings
  } = useDictation();

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getWordText = useCallback((word: string | { text: string }) => {
    return typeof word === 'string' ? word : word.text;
  }, []);

  const speakWord = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (speechRef.current) {
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.speed;
      
      utterance.onend = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(resolve, settings.interval * 100);
      };

      utterance.onerror = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        resolve();
      };

      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    });
  }, [settings.speed, settings.interval]);

  const playDictation = useCallback(async () => {
    setIsPlaying(true);
    
    try {
      for (let rep = 0; rep < settings.repetitions; rep++) {
        for (let i = currentWordIndex; i < wordSets.length; i++) {
          if (!isPlaying) return;
          
          setCurrentWordIndex(i);
          await speakWord(getWordText(wordSets[i]));
        }
        
        if (rep < settings.repetitions - 1) {
          setCurrentWordIndex(0);
        }
      }
    } finally {
      setIsPlaying(false);
    }
  }, [
    wordSets,
    currentWordIndex,
    settings.repetitions,
    isPlaying,
    setIsPlaying,
    setCurrentWordIndex,
    speakWord,
    getWordText
  ]);

  const stopDictation = useCallback(() => {
    if (speechRef.current) {
      speechSynthesis.cancel();
      speechRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPlaying(false);
  }, [setIsPlaying]);

  useEffect(() => {
    return () => {
      stopDictation();
    };
  }, [stopDictation]);

  const nextWord = useCallback(() => {
    if (currentWordIndex < wordSets.length - 1) {
      stopDictation();
      setCurrentWordIndex(currentWordIndex + 1);
    }
  }, [currentWordIndex, wordSets.length, stopDictation, setCurrentWordIndex]);

  const previousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      stopDictation();
      setCurrentWordIndex(currentWordIndex - 1);
    }
  }, [currentWordIndex, stopDictation, setCurrentWordIndex]);

  return {
    playDictation,
    stopDictation,
    nextWord,
    previousWord
  };
};