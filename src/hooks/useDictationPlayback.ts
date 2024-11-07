import { useDictation } from '../context/DictationContext';

export const useDictationPlayback = () => {
  const { wordSets, isPlaying, setIsPlaying, currentWordIndex, setCurrentWordIndex } = useDictation();

  const playDictation = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      playFromIndex(currentWordIndex);
    }
  };

  const playFromIndex = (index: number) => {
    if (index < wordSets.length) {
      const word = wordSets[index];
      const audio = new Audio(word.audioUrl);
      audio.play();

      audio.onended = () => {
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
  };

  const nextWord = () => {
    if (currentWordIndex < wordSets.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  return { playDictation, stopDictation, nextWord, previousWord };
};