import { useCallback, useRef, useEffect } from 'react';
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep isPlayingRef in sync with isPlaying state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    stop();
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const getWordText = useCallback((word: string | { text: string }) => {
    return typeof word === 'string' ? word : word.text;
  }, []);

  const playWord = useCallback(async (index: number, currentRepetition: number = 0) => {
    if (!isPlayingRef.current || index >= wordSets.length) {
      setIsPlaying(false);
      return;
    }

    setCurrentWordIndex(index);
    const word = wordSets[index];

    try {
      // Check if still playing before starting speech
      if (!isPlayingRef.current) return;

      // Speak current word
      await speak(getWordText(word), {
        rate: settings.speed,
        interval: settings.interval
      });

      // Check if still playing after speech
      if (!isPlayingRef.current) return;

      // If we haven't finished repeating the current word
      if (currentRepetition < settings.repetitions - 1) {
        // Check if still playing before setting timeout
        if (!isPlayingRef.current) return;

        timeoutRef.current = setTimeout(() => {
          // Check if still playing before next repetition
          if (!isPlayingRef.current) return;
          playWord(index, currentRepetition + 1);
        }, settings.interval * 1000);
        return;
      }

      // Move to next word after interval
      // Check if still playing before setting timeout
      if (!isPlayingRef.current) return;

      timeoutRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          if (index < wordSets.length - 1) {
            playWord(index + 1, 0);
          } else {
            setIsPlaying(false);
          }
        }
      }, settings.interval * 1000);

    } catch (error) {
      console.error('Error playing word:', error);
      setIsPlaying(false);
    }
  }, [wordSets, settings, speak, getWordText, setCurrentWordIndex, setIsPlaying]);

  const playDictation = useCallback(() => {
    if (!wordSets.length) return;
    
    cleanup();
    setIsPlaying(true);
    isPlayingRef.current = true;
    playWord(currentWordIndex);
  }, [wordSets, currentWordIndex, cleanup, setIsPlaying, playWord]);

  const stopDictation = useCallback(() => {
    // Immediately update the playing state to prevent any new operations
    isPlayingRef.current = false;
    setIsPlaying(false);

    // Clear all timeouts immediately
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Stop any ongoing speech synthesis
    stop();
    window.speechSynthesis.cancel(); // Force cancel any ongoing speech

    // Reset the speech synthesis state
    window.speechSynthesis.resume(); // Ensure speech synthesis isn't paused
    window.speechSynthesis.cancel(); // Cancel again after resume

    // Clear any queued speech synthesis utterances
    const utterances = window.speechSynthesis.getVoices();
    if (utterances.length > 0) {
      window.speechSynthesis.cancel();
    }

    // Reset any ongoing state
    timeoutRef.current = null;
  }, [stop, setIsPlaying]);

  const nextWord = useCallback(() => {
    if (currentWordIndex < wordSets.length - 1) {
      stopDictation();
      setCurrentWordIndex(currentWordIndex + 1);
      // Auto-play after moving to next word
      setTimeout(() => playDictation(), 100); // Small delay to ensure state is updated
    }
  }, [currentWordIndex, wordSets.length, stopDictation, setCurrentWordIndex, playDictation]);

  const previousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      stopDictation();
      setCurrentWordIndex(currentWordIndex - 1);
      // Auto-play after moving to previous word
      setTimeout(() => playDictation(), 100); // Small delay to ensure state is updated
    }
  }, [currentWordIndex, stopDictation, setCurrentWordIndex, playDictation]);

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