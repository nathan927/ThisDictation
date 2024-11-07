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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();

    if (typeof word === 'object' && 'audioUrl' in word) {
      return playAudio(word.audioUrl);
    }

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
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const playCurrentWord = async () => {
    if (!isPlaying || wordSets.length === 0) return;

    const currentWord = wordSets[currentWordIndex];
    if (!currentWord) return;

    for (let i = 0; i < settings.repetitions; i++) {
      if (!isPlaying) break;
      await speakWord(currentWord);
      if (i < settings.repetitions - 1) {
        await new Promise(resolve => setTimeout(resolve, settings.interval * 1000));
      }
    }

    if (isPlaying && currentWordIndex < wordSets.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
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
    };
  }, [currentWordIndex, isPlaying]);

  const playDictation = () => {
    if (wordSets.length === 0) return;
    setIsPlaying(true);
    playCurrentWord();
  };

  const stopDictation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
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
    previousWord
  };
};