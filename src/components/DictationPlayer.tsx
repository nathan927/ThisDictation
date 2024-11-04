import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';
import { useDictationPlayback } from '../hooks/useDictationPlayback';

interface Word {
  text: string;
  audioUrl?: string;
}

const DictationPlayer: React.FC = () => {
  const { t } = useTranslation();
  const { wordSets, setWordSets, currentWordIndex, setCurrentWordIndex } = useDictation();
  const { playDictation, pauseDictation, nextWord, previousWord } = useDictationPlayback();
  const { isPlaying } = useDictation();

  const handleDelete = () => {
    if (wordSets.length > 0) {
      const newWordSets = [...wordSets];
      newWordSets.splice(currentWordIndex, 1);
      setWordSets(newWordSets);
      if (currentWordIndex >= newWordSets.length) {
        setCurrentWordIndex(Math.max(0, newWordSets.length - 1));
      }
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm(t('Are you sure you want to delete all words?'))) {
      setWordSets([]);
      setCurrentWordIndex(0);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('Dictation Player')}</h2>
      
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">
              {t('Word Progress')}: {currentWordIndex + 1} {t('of')} {wordSets.length}
            </span>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          <button
            onClick={previousWord}
            disabled={currentWordIndex === 0 || isPlaying}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {t('Previous')}
          </button>
          
          <button
            onClick={isPlaying ? pauseDictation : playDictation}
            className={`px-4 py-2 rounded text-white ${
              isPlaying ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isPlaying ? t('Pause') : t('Play')}
          </button>
          
          <button
            onClick={nextWord}
            disabled={currentWordIndex === wordSets.length - 1 || isPlaying}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {t('Next')}
          </button>
        </div>

        <div className="flex justify-center space-x-2">
          <button
            onClick={handleDelete}
            disabled={wordSets.length === 0}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {t('Delete')}
          </button>
          
          <button
            onClick={handleDeleteAll}
            disabled={wordSets.length === 0}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {t('Delete All')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DictationPlayer;
