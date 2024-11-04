import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';
import { useDictationPlayback } from '../hooks/useDictationPlayback';

// Add resumeDictation to the type definition
interface DictationPlayerProps {
  playDictation: () => void;
  pauseDictation: () => void;
  resumeDictation: () => void;
  stopDictation: () => void;
  nextWord: () => void;
  previousWord: () => void;
  repetitionCount: number;
}

const DictationPlayer: React.FC = () => {
  const { t } = useTranslation();
  const { wordSets, currentWordIndex, isPlaying, setWordSets, setIsPlaying } = useDictation();
  const {
    playDictation,
    pauseDictation,
    stopDictation,
    nextWord,
    previousWord
  } = useDictationPlayback();

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseDictation();
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        playDictation();
      }
    }
  };

  const handleExport = () => {
    const wordTexts = wordSets.map(word => getWordText(word));
    const blob = new Blob([wordTexts.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dictation-words.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ProgressBar: React.FC = () => {
    const { settings } = useDictation();
    
    const wordProgress = wordSets.length > 0 ? 
      (Math.min(currentWordIndex, wordSets.length - 1) / (wordSets.length - 1)) * 100 : 0;
    
    return (
      <div className="mb-6 space-y-4">
        <div>
          <div className="h-2 bg-gray-200 rounded">
            <div 
              className="h-2 bg-blue-500 rounded transition-all duration-300" 
              style={{ width: `${Math.min(100, Math.max(0, wordProgress))}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 text-center mt-1">
            {t('Word Progress')}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to get word text
  const getWordText = (word: string | { text: string }) => {
    return typeof word === 'string' ? word : word.text;
  };

  const handleDelete = () => {
    if (wordSets.length === 0) return;
    
    const newWords = [...wordSets];
    newWords.splice(currentWordIndex, 1);
    setWordSets(newWords);
    stopDictation();
    
    // Adjust currentWordIndex if we're at the end of the list
    if (currentWordIndex >= newWords.length) {
      setCurrentWordIndex(Math.max(0, newWords.length - 1));
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm(t('Are you sure you want to delete all words?'))) {
      setWordSets([]);
      stopDictation();
      setCurrentWordIndex(0);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('Dictation Player')}</h2>
      
      <div className="mb-4">
        <div className="text-center text-2xl font-bold mb-4">
          {wordSets[currentWordIndex] ? 
            getWordText(wordSets[currentWordIndex]) : 
            'No words added'}
        </div>
        
        <div className="text-sm text-gray-500 text-center">
          {wordSets.length > 0 ? 
            `${Math.min(currentWordIndex + 1, wordSets.length)} of ${wordSets.length} word(s)` : 
            '0 of 0 word(s)'}
        </div>
      </div>

      <ProgressBar />

      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={handlePlayPause}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={wordSets.length === 0}
        >
          {isPlaying ? t('Pause') : t('Play')}
        </button>
        <button
          onClick={stopDictation}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          disabled={!isPlaying}
        >
          {t('Stop')}
        </button>
        <button
          onClick={previousWord}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          disabled={currentWordIndex === 0}
        >
          {t('Previous')}
        </button>
        <button
          onClick={nextWord}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          disabled={currentWordIndex === wordSets.length - 1}
        >
          {t('Next')}
        </button>
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={handleDelete}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          disabled={wordSets.length === 0}
        >
          {t('Delete')}
        </button>
        <button
          onClick={handleDeleteAll}
          className="bg-yellow-700 text-white px-4 py-2 rounded hover:bg-yellow-800"
          disabled={wordSets.length === 0}
        >
          {t('Delete All')}
        </button>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={wordSets.length === 0}
        >
          {t('Export')}
        </button>
      </div>
    </div>
  );
};

export default DictationPlayer;