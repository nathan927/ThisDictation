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
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopDictation();
    };
  }, []);

  const getWordText = useCallback((word: string | { text: string }) => {
    return typeof word === 'string' ? word : word.text;
  }, []);

  const speakWord = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isMountedRef.current) {
        resolve();
        return;
      }

      if (speechRef.current) {
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.speed;
      
      utterance.onend = () => {
        if (isMountedRef.current) {
          timeoutRef.current = setTimeout(resolve, settings.interval * 100);
        }
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        resolve();
      };

      speechRef.current = utterance;
      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis failed:', error);
        resolve();
      }
    });
  }, [settings.speed, settings.interval]);

  const playDictation = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsPlaying(true);
    
    try {
      for (let rep = 0; rep < settings.repetitions; rep++) {
        for (let i = currentWordIndex; i < wordSets.length; i++) {
          if (!isPlaying || !isMountedRef.current) return;
          
          setCurrentWordIndex(i);
          await speakWord(getWordText(wordSets[i]));
        }
        
        if (rep < settings.repetitions - 1) {
          setCurrentWordIndex(0);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    }
  }, [
    wordSets,
    currentWordIndex,
    settings.repetitions,
    isPlaying,
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
  }, []);

  const nextWord = useCallback(() => {
    if (currentWordIndex < wordSets.length - 1) {
      stopDictation();
      setCurrentWordIndex(currentWordIndex + 1);
    }
  }, [currentWordIndex, wordSets.length, stopDictation]);

  const previousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      stopDictation();
      setCurrentWordIndex(currentWordIndex - 1);
    }
  }, [currentWordIndex, stopDictation]);

  return {
    playDictation,
    stopDictation,
    nextWord,
    previousWord
  };
};