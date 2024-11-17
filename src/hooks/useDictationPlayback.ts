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
  const isMobile = useRef<boolean>(isMobileBrowser());
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingRef = useRef<boolean>(false);

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

  // PC version - unchanged
  const speakWordPC = async (word: string | WordWithAudio) => {
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

  // Mobile version - optimized for mobile browsers
  const speakWordMobile = async (word: string | WordWithAudio) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }

    if (typeof word === 'object' && 'audioUrl' in word) {
      return playAudio(word.audioUrl);
    }

    return new Promise<void>((resolve) => {
      const text = typeof word === 'string' ? word : word.text;
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
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

      // Handle completion
      const handleEnd = () => {
        if (!speakingRef.current) return;
        speakingRef.current = false;
        utterance.onend = null;
        utterance.onerror = null;
        resolve();
      };

      utterance.onend = handleEnd;
      utterance.onerror = () => {
        console.error('Speech synthesis error, trying to continue...');
        handleEnd();
      };

      // Start speaking
      speakingRef.current = true;
      window.speechSynthesis.speak(utterance);

      // Mobile-specific: Ensure speech starts and continues
      const keepAlive = setInterval(() => {
        if (speakingRef.current) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 5000);

      // Fallback timer in case speech synthesis fails
      setTimeout(() => {
        if (speakingRef.current) {
          handleEnd();
        }
      }, Math.max(2000, text.length * 200));
    });
  };

  const speakWord = isMobile.current ? speakWordMobile : speakWordPC;

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
      // On error, try to continue with next word
      if (isPlaying && currentWordIndex < wordSets.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      }
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
  };

  const stopDictation = () => {
    speakingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const nextWord = () => {
    if (currentWordIndex < wordSets.length - 1) {
      speakingRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      speakingRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speakingRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
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