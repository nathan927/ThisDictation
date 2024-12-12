import { useState, useEffect, useRef, useCallback } from 'react';
import { useDictation } from '../context/DictationContext';

interface WordWithAudio {
  text: string;
  audioUrl?: string;
}

interface SpeechOptions {
  rate: number;
  interval: number;
  lang: string;
}

export const useDictationPlayback = () => {
  const { 
    wordSets, 
    currentWordIndex, 
    setCurrentWordIndex,
    isPlaying, 
    setIsPlaying, 
    settings 
  } = useDictation();

  // Refs for managing playback state
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isStoppingRef = useRef(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Cleanup function for speech synthesis
  const cleanupSpeech = useCallback(() => {
    // Cancel all speech synthesis
    window.speechSynthesis.pause();
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();

    // Clear speech refs
    if (speechRef.current) {
      speechRef.current.onend = null;
      speechRef.current.onerror = null;
      speechRef.current = null;
    }
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current.onend = null;
      currentUtteranceRef.current.onerror = null;
      currentUtteranceRef.current = null;
    }

    // Clear all timeouts
    activeTimeoutsRef.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    activeTimeoutsRef.current.clear();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Stop all playback and clean up
  const stopDictation = useCallback(() => {
    // Set stopping flag first
    isStoppingRef.current = true;

    // Cancel speech synthesis multiple times to ensure it stops
    cleanupSpeech();
    window.speechSynthesis.cancel();

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onpause = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Reset state
    setIsPlaying(false);

    // Reset stopping flag after cleanup
    setTimeout(() => {
      isStoppingRef.current = false;
    }, 100);
  }, [cleanupSpeech, setIsPlaying]);

  // Text-to-speech function
  const speak = useCallback(async (text: string, options: SpeechOptions): Promise<void> => {
    if (isStoppingRef.current) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        // Check if already stopping
        if (isStoppingRef.current) {
          resolve();
          return;
        }

        cleanupSpeech();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate;
        utterance.lang = options.lang;

        utterance.onend = () => {
          if (isStoppingRef.current) {
            cleanupSpeech();
            resolve();
            return;
          }
          resolve();
        };

        utterance.onerror = () => {
          cleanupSpeech();
          resolve();
        };

        // Store refs for cleanup
        currentUtteranceRef.current = utterance;
        speechRef.current = utterance;

        // Start speaking
        window.speechSynthesis.speak(utterance);

        // Set a safety timeout
        const safetyTimeout = setTimeout(() => {
          if (isStoppingRef.current) {
            cleanupSpeech();
            resolve();
          }
        }, (text.length * 100) + 1000);
        activeTimeoutsRef.current.add(safetyTimeout);

      } catch (error) {
        console.error('Speech synthesis error:', error);
        resolve();
      }
    });
  }, [cleanupSpeech]);

  // Play current word with repetitions
  const playCurrentWord = useCallback(async () => {
    if (!isPlaying || wordSets.length === 0 || isStoppingRef.current) return;

    const currentWord = wordSets[currentWordIndex];
    if (!currentWord) return;

    try {
      for (let i = 0; i < settings.repetitions && !isStoppingRef.current; i++) {
        // Check if stopped
        if (!isPlaying || isStoppingRef.current) break;

        // Handle voice recordings
        if (typeof currentWord === 'object' && 'audioUrl' in currentWord) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }

          if (isStoppingRef.current) break;

          audioRef.current = new Audio(currentWord.audioUrl);
          await new Promise<void>((resolve) => {
            if (!audioRef.current || isStoppingRef.current) {
              resolve();
              return;
            }
            audioRef.current.onended = () => resolve();
            audioRef.current.play().catch(() => resolve());
          });
        } else {
          // Handle text-to-speech
          if (isStoppingRef.current) break;

          const text = typeof currentWord === 'string' ? currentWord : currentWord.text;
          const options: SpeechOptions = {
            rate: settings.speed,
            interval: settings.interval,
            lang: 'en-US'
          };

          switch (settings.pronunciation) {
            case 'Cantonese':
              options.lang = 'zh-HK';
              break;
            case 'Mandarin':
              options.lang = 'zh-CN';
              break;
          }

          await speak(text, options);
        }

        // Check if stopped before waiting
        if (isStoppingRef.current) break;

        // Wait between repetitions
        if (i < settings.repetitions - 1) {
          await new Promise<void>((resolve) => {
            if (isStoppingRef.current) {
              resolve();
              return;
            }
            const timeout = setTimeout(() => resolve(), settings.interval * 1000);
            activeTimeoutsRef.current.add(timeout);
            timeoutRef.current = timeout;
          });
        }
      }

      // Move to next word if not stopped
      if (isPlaying && !isStoppingRef.current && currentWordIndex < wordSets.length - 1) {
        const timeout = setTimeout(() => {
          if (!isStoppingRef.current) {
            setCurrentWordIndex(currentWordIndex + 1);
          }
        }, settings.interval * 1000);
        activeTimeoutsRef.current.add(timeout);
        timeoutRef.current = timeout;
      } else if (currentWordIndex === wordSets.length - 1) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error playing word:', error);
      setIsPlaying(false);
    }
  }, [currentWordIndex, isPlaying, settings, speak, wordSets, setCurrentWordIndex, setIsPlaying]);

  // Navigation functions
  const nextWord = useCallback(() => {
    if (currentWordIndex < wordSets.length - 1) {
      stopDictation();
      setCurrentWordIndex(currentWordIndex + 1);
    }
  }, [currentWordIndex, stopDictation, setCurrentWordIndex, wordSets.length]);

  const previousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      stopDictation();
      setCurrentWordIndex(currentWordIndex - 1);
    }
  }, [currentWordIndex, stopDictation, setCurrentWordIndex]);

  const playDictation = useCallback(() => {
    if (wordSets.length === 0) return;
    isStoppingRef.current = false;
    setIsPlaying(true);
  }, [wordSets.length, setIsPlaying]);

  // Effect for playing words and cleanup
  useEffect(() => {
    if (isPlaying) {
      isStoppingRef.current = false;
      playCurrentWord();
    }
    return () => {
      cleanupSpeech();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPlaying, playCurrentWord, cleanupSpeech]);

  return {
    playDictation,
    stopDictation,
    nextWord,
    previousWord
  };
};