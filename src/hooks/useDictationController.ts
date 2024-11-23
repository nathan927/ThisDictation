import { useCallback, useRef } from 'react';
import { useDictation } from '../context/DictationContext';
import { useSpeechSynthesis } from './useSpeechSynthesis';

export const useDictationController = () => {
  const {
    wordSets,
    currentWordIndex,
    setCurrentWordIndex,
    isPlaying,
    setIsPlaying,
    settings
  } = useDictation();
  
  const { speak, stop } = useSpeechSynthesis();
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const getWordText = useCallback((word: string | { text: string }) => {
    return typeof word === 'string' ? word : word.text;
  }, []);

  const playDictation = useCallback(async () => {
    setIsPlaying(true);
    
    try {
      for (let rep = 0; rep < settings.repetitions; rep++) {
        for (let i = currentWordIndex; i < wordSets.length; i++) {
          if (!isPlayingRef.current) return;
          
          setCurrentWordIndex(i);
          await speak(getWordText(wordSets[i]), {
            rate: settings.speed,
            interval: settings.interval
          });
        }
        
        if (rep < settings.repetitions - 1) {
          setCurrentWordIndex(0);
        }
      }
    } catch (error) {
      console.error('Dictation playback error:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [
    wordSets,
    currentWordIndex,
    settings,
    setCurrentWordIndex,
    setIsPlaying,
    speak
  ]);

  const stopDictation = useCallback(() => {
    stop();
    setIsPlaying(false);
  }, [stop, setIsPlaying]);

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
    previousWord,
    isPlaying,
    currentWord: wordSets[currentWordIndex],
    totalWords: wordSets.length,
    currentIndex: currentWordIndex
  };
};