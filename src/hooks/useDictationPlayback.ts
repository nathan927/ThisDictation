import { useState, useEffect, useRef } from 'react';
import { useDictation } from '../context/DictationContext';

interface WordWithAudio {
  text: string;
  audioUrl?: string;
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

  const [repetitionCount, setRepetitionCount] = useState(1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (audioUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        resolve();
      };
      audioRef.current.play();
    });
  };

  const speakWord = async (word: string | WordWithAudio) => {
    // Stop any ongoing audio or speech
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();

    // Check if word is a voice recording
    if (typeof word === 'object' && 'audioUrl' in word) {
      return playAudio(word.audioUrl);
    }

    // For non-voice recording words, use text-to-speech
    const text = typeof word === 'string' ? word : word.text;
    const utterance = new SpeechSynthesisUtterance(text);
    
    switch (settings.pronunciation) {
      case 'Cantonese':
        utterance.lang = 'zh-HK';
        break;
      case 'Mandarin':
        utterance.lang = 'zh-CN';
        break;
      default:
        utterance.lang = 'en-US';
    }

    utterance.rate = settings.speed;

    return new Promise<void>((resolve) => {
      utterance.onend = () => {
        if (isPlaying) { // Only resolve if still playing
          resolve();
        }
      };
      utterance.onerror = () => resolve(); // Resolve on error to prevent hanging
      window.speechSynthesis.speak(utterance);
    });
  };

  const playCurrentWord = async () => {
    if (!isPlaying || wordSets.length === 0) return;

    const currentWord = wordSets[currentWordIndex];
    if (!currentWord) return;

    let repetition = 0;
    while (isPlaying && repetition < settings.repetitions) {
      await speakWord(currentWord);
      repetition++;
      
      // Break if stopped or last repetition
      if (!isPlaying || repetition >= settings.repetitions) break;
      
      // Wait for interval
      await new Promise<void>((resolve) => {
        timeoutRef.current = setTimeout(() => {
          if (isPlaying) { // Only resolve if still playing
            resolve();
          }
        }, settings.interval * 1000);
      });
    }

    // Move to next word if still playing and not last word
    if (isPlaying && currentWordIndex < wordSets.length - 1) {
      timeoutRef.current = setTimeout(() => {
        if (isPlaying) { // Only proceed if still playing
          setCurrentWordIndex(currentWordIndex + 1);
        }
      }, settings.interval * 1000);
    } else if (currentWordIndex === wordSets.length - 1) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playCurrentWord();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.speechSynthesis.cancel(); // Ensure speech is cancelled on cleanup
    };
  }, [currentWordIndex, isPlaying]);

  const playDictation = () => {
    if (wordSets.length === 0) return;
    setIsPlaying(true);
    playCurrentWord();
  };

  const stopDictation = () => {
    setIsPlaying(false); // Set this first to prevent new utterances
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const nextWord = () => {
    if (currentWordIndex < wordSets.length - 1) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    playDictation,
    stopDictation,
    nextWord,
    previousWord,
    repetitionCount
  };
};