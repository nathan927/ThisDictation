import { useState, useEffect, useRef } from 'react';
import { useDictation } from '../context/DictationContext';

interface WordWithAudio {
  text: string;
  audioUrl?: string;
}

// Utility function to detect mobile browser
const isMobileBrowser = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingRef = useRef<boolean>(false);

  // Cleanup function to ensure proper resource release
  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (utteranceRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    speakingRef.current = false;
  };

  const playAudio = (audioUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      cleanup();
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        resolve();
      };
      audioRef.current.play();
    });
  };

  const speakWord = async (word: string | WordWithAudio) => {
    // Handle audio URL if present
    if (typeof word === 'object' && 'audioUrl' in word && word.audioUrl) {
      return playAudio(word.audioUrl);
    }

    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not available');
      return Promise.reject(new Error('Speech synthesis not available'));
    }

    // Ensure clean state
    cleanup();

    return new Promise<void>((resolve) => {
      const text = typeof word === 'string' ? word : word.text;
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure language
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

      // Track completion state
      let completed = false;
      const completeSpeak = () => {
        if (completed) return;
        completed = true;
        cleanup();
        resolve();
      };

      // Set up event handlers
      utterance.onend = completeSpeak;
      utterance.onerror = () => {
        console.error('Speech synthesis error');
        completeSpeak();
      };

      // Start speaking
      speakingRef.current = true;
      window.speechSynthesis.speak(utterance);

      // Backup completion check
      const checkInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking && speakingRef.current) {
          clearInterval(checkInterval);
          completeSpeak();
        }
      }, 50);

      // Ensure speech synthesis stays active
      const keepAlive = setInterval(() => {
        if (speakingRef.current && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 250);

      // Cleanup intervals after maximum duration
      const maxDuration = Math.max(2000, text.length * 200);
      setTimeout(() => {
        clearInterval(checkInterval);
        clearInterval(keepAlive);
        if (speakingRef.current) {
          completeSpeak();
        }
      }, maxDuration);
    });
  };

  const playCurrentWord = async () => {
    if (!isPlaying || wordSets.length === 0) return;

    const currentWord = wordSets[currentWordIndex];
    if (!currentWord) return;

    try {
      for (let i = 0; i < settings.repetitions; i++) {
        if (!isPlaying) break;
        await speakWord(currentWord);
        if (i < settings.repetitions - 1 && isPlaying) {
          await new Promise(resolve => setTimeout(resolve, settings.interval * 1000));
        }
      }

      if (isPlaying && currentWordIndex < wordSets.length - 1) {
        timeoutRef.current = setTimeout(() => {
          setCurrentWordIndex(currentWordIndex + 1);
        }, settings.interval * 1000);
      } else if (currentWordIndex === wordSets.length - 1) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error playing word:', error);
      cleanup();
      if (isPlaying && currentWordIndex < wordSets.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      }
    }
  };

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup();
      } else if (isPlaying) {
        playCurrentWord();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanup();
    };
  }, [isPlaying]);

  // Handle playback state changes
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
    
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not available');
      return;
    }

    setIsPlaying(true);
  };

  const stopDictation = () => {
    cleanup();
    setIsPlaying(false);
  };

  const nextWord = () => {
    if (currentWordIndex < wordSets.length - 1) {
      cleanup();
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      cleanup();
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  return {
    playDictation,
    stopDictation,
    nextWord,
    previousWord,
    repetitionCount
  };
};