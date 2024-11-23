import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../../context/DictationContext';
import { useDictationController } from '../../hooks/useDictationController';
import { WordDisplay } from './WordDisplay';
import { ProgressBar } from './ProgressBar';

const DictationPlayer: React.FC = () => {
  const { t } = useTranslation();
  const { deleteWord, deleteAllWords, setCurrentWordIndex } = useDictation();
  const {
    playDictation,
    stopDictation,
    nextWord,
    previousWord,
    isPlaying,
    currentWord,
    totalWords,
    currentIndex
  } = useDictationController();

  const handleDelete = () => {
    if (currentIndex >= 0 && currentIndex < totalWords) {
      deleteWord(currentIndex);
      if (currentIndex === totalWords - 1) {
        setCurrentWordIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm(t('Are you sure you want to delete all words?'))) {
      deleteAllWords();
      setCurrentWordIndex(0);
    }
  };

  const handleExport = () => {
    const BOM = '\uFEFF';
    const text = currentWord ? 
      (typeof currentWord === 'string' ? currentWord : currentWord.text) : '';
    const blob = new Blob([BOM + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dictation_words.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 relative">
      <h2 className="text-xl font-bold mb-4">{t('Dictation Player')}</h2>
      
      <div className="flex flex-col space-y-4">
        <WordDisplay 
          currentWord={currentWord}
          currentIndex={currentIndex}
          totalWords={totalWords}
        />
        
        <ProgressBar 
          currentIndex={currentIndex}
          totalWords={totalWords}
        />

        <div className="flex justify-center space-x-2">
          <button
            onClick={previousWord}
            disabled={currentIndex === 0 || isPlaying}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {t('Previous')}
          </button>
          
          <button
            onClick={isPlaying ? stopDictation : playDictation}
            className={`px-4 py-2 rounded text-white ${
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isPlaying ? t('Stop') : t('Play')}
          </button>
          
          <button
            onClick={nextWord}
            disabled={currentIndex === totalWords - 1 || isPlaying}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {t('Next')}
          </button>
        </div>

        <div className="flex justify-center space-x-2">
          <button
            onClick={handleExport}
            disabled={totalWords === 0}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {t('Export')}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={totalWords === 0}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
          >
            {t('Delete')}
          </button>
          
          <button
            onClick={handleDeleteAll}
            disabled={totalWords === 0}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
          >
            {t('Delete All')}
          </button>
        </div>
      </div>

      <div className="w-full text-center mt-4 text-xs text-red-500 sm:absolute sm:bottom-2 sm:left-2 sm:text-left sm:w-auto">
        {t('Please click "Play" twice in the first time.')}
      </div>
    </div>
  );
};

export default DictationPlayer;