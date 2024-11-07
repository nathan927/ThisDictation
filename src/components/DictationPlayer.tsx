import React from 'react';
import { useDictationPlayback } from '../hooks/useDictationPlayback';

const DictationPlayer: React.FC = () => {
  const { playDictation, stopDictation, nextWord, previousWord } = useDictationPlayback();

  return (
    <div>
      <button onClick={playDictation}>Play</button>
      <button onClick={stopDictation}>Stop</button>
      <button onClick={nextWord}>Next</button>
      <button onClick={previousWord}>Previous</button>
    </div>
  );
};

export default DictationPlayer;
