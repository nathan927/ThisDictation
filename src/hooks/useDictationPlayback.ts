import { useRef } from 'react';
import { useDictation } from '../context/DictationContext';

export const useDictationPlayback = () => {
  const { wordSets, isPlaying, setIsPlaying, currentWordIndex, setCurrentWordIndex } = useDictation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playDictation = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      playFromIndex(currentWordIndex);
    }
  };

  const playFromIndex = (index: number) => {
    if (index < wordSets.length) {
      const word = wordSets[index];
      audioRef.current = new Audio(word.audioUrl);
      audioRef.current.play();

      audioRef.current.onended = () => {
        setCurrentWordIndex(index + 1);
        playFromIndex(index + 1);
      };
    } else {
      stopDictation();
    }
  };

  const stopDictation = () => {
    setIsPlaying(false);
    setCurrentWordIndex(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return { playDictation, stopDictation };
};