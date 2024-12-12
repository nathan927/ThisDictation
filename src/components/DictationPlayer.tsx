import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';
import { useDictationPlayback } from '../hooks/useDictationPlayback';
import { speak } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

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
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { playDictation, stopDictation, nextWord, previousWord } = useDictationPlayback();

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handlePlayClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentWordIndex >= wordSets.length) {
        setCurrentWordIndex(0);
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    stopDictation();
  };

  const ProgressBar: React.FC = () => {
    const wordProgress = wordSets.length > 0 ? 
      (Math.min(currentWordIndex, wordSets.length - 1) / (wordSets.length - 1)) * 100 : 0;
    
    return (
      <div className="mb-6 space-y-4">
        <div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${Math.min(100, Math.max(0, wordProgress))}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 text-center mt-2 font-bold">
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

  // Cleanup audio URLs when component unmounts
  useEffect(() => {
    return () => {
      wordSets.forEach(word => {
        if (word.audioUrl) {
          URL.revokeObjectURL(word.audioUrl);
        }
      });
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-2xl p-6 relative backdrop-blur-sm border border-white/20">
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          setIsPlaying(true);
          if (currentWordIndex >= wordSets.length) {
            setCurrentWordIndex(0);
          }
        }}
      />
      <audio ref={audioRef} className="hidden" />
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
          {t('Dictation Player')}
        </h2>
        <div className="text-lg font-bold text-gray-700">
          {wordSets.length > 0 ? 
            `${Math.min(currentWordIndex + 1, wordSets.length)} ${t('of')} ${wordSets.length} ${t('word(s)')}` : 
            `0 ${t('of')} 0 ${t('word(s)')}`}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="mb-4 mt-8">
          <div className="text-center text-4xl font-bold mb-4 text-black">
            {wordSets[currentWordIndex] ? 
              getWordText(wordSets[currentWordIndex]) : 
              t('No words added')}
          </div>
        </div>

        <ProgressBar />

        <div className="grid grid-cols-3 gap-4 mb-4">
          <button
            onClick={previousWord}
            disabled={wordSets.length === 0 || currentWordIndex === 0 || isPlaying}
            className="w-full bg-violet-400 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {t('Previous')}
          </button>
          
          <button
            onClick={handlePlayClick}
            disabled={wordSets.length === 0}
            className={`w-full font-bold py-2 px-4 rounded-lg transition-colors duration-200 ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isPlaying ? t('Stop') : t('Play')}
          </button>
          
          <button
            onClick={nextWord}
            disabled={wordSets.length === 0 || currentWordIndex === wordSets.length - 1 || isPlaying}
            className="w-full bg-violet-400 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {t('Next')}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={handleExport}
            disabled={wordSets.length === 0}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {t('Export')}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={wordSets.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {t('Delete')}
          </button>

          <button
            onClick={handleDeleteAll}
            disabled={wordSets.length === 0}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {t('Delete All')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DictationPlayer;
