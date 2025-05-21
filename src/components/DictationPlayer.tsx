import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';
import { useDictationPlayback } from '../hooks/useDictationPlayback';
// import { speak } from '../services/api'; // speak seems unused in the provided code
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

// Word interface definition might be redundant if DictationContext exports it or if it's globally defined
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
  
  const { nextWord, previousWord } = useDictationPlayback(); // playDictation, stopDictation removed as they are implicitly handled by isPlaying and useEffect in useDictationPlayback

  const audioRef = useRef<HTMLAudioElement | null>(null); // Keep for direct audio control if needed

  const handleDelete = () => {
    if (!isAuthenticated) return; // Guard
    if (currentWordIndex >= 0 && currentWordIndex < wordSets.length) {
      deleteWord(currentWordIndex);
      // Logic to adjust currentWordIndex after deletion is handled by DictationContext or calling component
      if (currentWordIndex >= wordSets.length -1 && wordSets.length > 1) { // if last element was deleted
         setCurrentWordIndex(wordSets.length - 2);
      } else if (wordSets.length === 1 && currentWordIndex !==0 ) { // if only one element left and it's not the first
         setCurrentWordIndex(0);
      } else if (wordSets.length === 0) {
         setCurrentWordIndex(0);
      }
      // No change if deleting from middle and list is not empty
    }
  };

  const handleDeleteAll = () => {
    if (!isAuthenticated) return; // Guard
    if (window.confirm(t('Are you sure you want to delete all words?'))) {
      deleteAllWords();
      setCurrentWordIndex(0); // Reset index
      if(isPlaying) setIsPlaying(false); // Stop playback
    }
  };

  const handlePlayClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (wordSets.length === 0) return; // Don't play if no words

    setIsPlaying(!isPlaying); // Toggle play state
    if (!isPlaying && currentWordIndex >= wordSets.length) { // If starting play and index is out of bounds
      setCurrentWordIndex(0);
    }
  };

  // Stop dictation is handled by useDictationPlayback hook's useEffect cleanup when isPlaying becomes false
  // or when wordSets/currentWordIndex change mid-playback. Explicit handleStop might be redundant.

  const ProgressBar: React.FC = () => {
    if (!isAuthenticated || wordSets.length === 0) return null; // Don't show progress bar if not logged in or no words
    
    const progress = wordSets.length > 0 ? ((currentWordIndex + 1) / wordSets.length) * 100 : 0;
    
    return (
      <div className="mb-6 space-y-4">
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 text-center mt-2 font-bold">
            {t('Word Progress')} ({Math.min(currentWordIndex + 1, wordSets.length)}/{wordSets.length})
          </div>
        </div>
      </div>
    );
  };

  const handleExport = () => {
    if (!isAuthenticated) return; // Guard
    const BOM = '\uFEFF';
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

  const getWordText = (word: Word | string) => { // Type Word explicitly
    return typeof word === 'string' ? word : word.text;
  };

  useEffect(() => {
    // Cleanup audio URLs when component unmounts or wordSets change
    return () => {
      wordSets.forEach(word => {
        if (word.audioUrl) {
          URL.revokeObjectURL(word.audioUrl);
        }
      });
    };
  }, [wordSets]); // wordSets dependency for cleanup

  // Login Modal
  if (showLoginModal) {
    return (
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => { // On successful login, close modal and attempt to play
          setShowLoginModal(false);
          if (wordSets.length > 0) {
            setIsPlaying(true);
            if (currentWordIndex >= wordSets.length) {
              setCurrentWordIndex(0);
            }
          }
        }}
      />
    );
  }

  // Not Authenticated View
  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 mb-4">
          {t('Dictation Player')}
        </h2>
        <p className="text-gray-600">{t('Please log in to view and play your phrases.')}</p>
        {/* Optionally, a button to open the login modal directly */}
        <button 
          onClick={() => setShowLoginModal(true)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {t('Login')}
        </button>
      </div>
    );
  }

  // Authenticated but No Words View
  if (wordSets.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 mb-4">
          {t('Dictation Player')}
        </h2>
        <p className="text-gray-600">{t('No phrases added yet. Use the input section to add some!')}</p>
      </div>
    );
  }
  
  // Main Player View (Authenticated and words exist)
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-2xl p-6 relative backdrop-blur-sm border border-white/20">
      <audio ref={audioRef} className="hidden" /> {/* For potential direct audio element usage by hooks */}
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
          {t('Dictation Player')}
        </h2>
        <div className="text-lg font-bold text-gray-700">
          {/* Progress display moved to ProgressBar component for cleaner layout */}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="mb-4 mt-8">
          <div className="text-center text-4xl font-bold mb-4 text-black min-h-[50px]"> {/* Added min-h for layout stability */}
            {wordSets[currentWordIndex] ? getWordText(wordSets[currentWordIndex]) : ""}
          </div>
        </div>

        <ProgressBar />

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <button
              onClick={previousWord}
              disabled={!isAuthenticated || wordSets.length === 0 || currentWordIndex === 0 || isPlaying}
              className="w-full sm:w-32 bg-violet-400 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {t('Previous')}
            </button>
            
            <button
              onClick={handlePlayClick}
              disabled={!isAuthenticated || wordSets.length === 0}
              className={`w-full sm:w-32 font-bold py-2 px-4 rounded-lg transition-colors duration-200 ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              } ${(!isAuthenticated || wordSets.length === 0) ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}`}
            >
              {isPlaying ? t('Stop') : t('Play')}
            </button>
            
            <button
              onClick={nextWord}
              disabled={!isAuthenticated || wordSets.length === 0 || currentWordIndex >= wordSets.length - 1 || isPlaying}
              className="w-full sm:w-32 bg-violet-400 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {t('Next')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={handleExport}
              disabled={!isAuthenticated || wordSets.length === 0}
              className="w-full sm:w-32 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {t('Export')}
            </button>
            
            <button
              onClick={handleDelete}
              disabled={!isAuthenticated || wordSets.length === 0}
              className="w-full sm:w-32 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {t('Delete')}
            </button>

            <button
              onClick={handleDeleteAll}
              disabled={!isAuthenticated || wordSets.length === 0}
              className="w-full sm:w-32 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
            >
              {t('Delete All')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictationPlayer;
