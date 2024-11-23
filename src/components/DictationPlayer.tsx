import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';
import { useDictationPlayback } from '../hooks/useDictationPlayback';
import { speak } from '../services/api';

interface Word {
  text: string;
  audioUrl?: string;
}

const DictationPlayer: React.FC = () => {
  const { t } = useTranslation();
  const { 
    wordSets, 
    deleteWord, 
    deleteAllWords, 
    isPlaying, 
    setIsPlaying,
    currentWordIndex,
    setCurrentWordIndex 
  } = useDictation();
  
  const { playDictation, stopDictation, nextWord, previousWord } = useDictationPlayback();

  const handleDelete = () => {
    if (currentWordIndex >= 0 && currentWordIndex < wordSets.length) {
      deleteWord(currentWordIndex);
      if (currentWordIndex === wordSets.length - 1) {
        setCurrentWordIndex(Math.max(0, currentWordIndex - 1));
      }
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm(t('Are you sure you want to delete all words?'))) {
      deleteAllWords();
      setCurrentWordIndex(0);
      setIsPlaying(false);
    }
  };

  const ProgressBar: React.FC = () => {
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

  const handleExport = () => {
    const BOM = '\uFEFF';  // Add BOM for UTF-8
    const text = wordSets.map(word => getWordText(word)).join('\n');
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

  // Helper function to get word text
  const getWordText = (word: string | { text: string }) => {
    return typeof word === 'string' ? word : word.text;
  };

  const playWord = async (index: number) => {
    if (index >= wordSets.length) {
      setIsPlaying(false);
      return;
    }

    try {
      setCurrentWordIndex(index);
      await speak(wordSets[index].text);
      
      // Add a small delay between words
      setTimeout(() => {
        // Continue with next word if still playing
        if (isPlaying) {
          playWord(index + 1);
        }
      }, 1000); // 1 second delay between words
    } catch (error) {
      console.error('Error playing word:', error);
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    // Start from current word index or restart if at end
    const startIndex = currentWordIndex >= wordSets.length ? 0 : currentWordIndex;
    playWord(startIndex);
  };

  const handleStop = () => {
    stopDictation();
    setCurrentWordIndex(0);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 relative">
      <h2 className="text-xl font-bold mb-4">{t('Dictation Player')}</h2>
      
      <div className="flex flex-col space-y-4">
        <div className="mb-4">
          <div className="text-center text-2xl font-bold mb-4">
            {wordSets[currentWordIndex] ? 
              getWordText(wordSets[currentWordIndex]) : 
              t('No words added')}
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            {wordSets.length > 0 ? 
              `${Math.min(currentWordIndex + 1, wordSets.length)} ${t('of')} ${wordSets.length} ${t('word(s)')}` : 
              `0 ${t('of')} 0 ${t('word(s)')}`}
          </div>
        </div>

        <ProgressBar />

        <div className="flex justify-center space-x-2">
          <button
            onClick={previousWord}
            disabled={currentWordIndex === 0 || isPlaying}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {t('Previous')}
          </button>
          
          <button
            onClick={isPlaying ? handleStop : handlePlay}
            className={`px-4 py-2 rounded text-white ${
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isPlaying ? t('Stop') : t('Play')}
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
            onClick={handleExport}
            disabled={wordSets.length === 0}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {t('Export')}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={wordSets.length === 0}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
          >
            {t('Delete')}
          </button>
          
          <button
            onClick={handleDeleteAll}
            disabled={wordSets.length === 0}
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
