import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Snackbar from '../components/Snackbar';
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Define Word interface locally as it's not exported from AuthContext
interface Word {
  text: string;
  audioUrl?: string;
}

interface DictationSettings {
  repetitions: number;
  interval: number;
  speed: number;
  pronunciation: string;
  language: string;
}

interface DictationContextType {
  wordSets: Word[];
  currentWordIndex: number;
  isPlaying: boolean;
  settings: DictationSettings;
  snackbarOpen: boolean; // Kept for manual updates if needed elsewhere
  snackbarMessage: string;
  setWordSets: React.Dispatch<React.SetStateAction<Word[]>>; // Direct setter
  addWordSet: (newWords: Word[]) => void; // Example of a method that might use snackbar
  deleteWord: (index: number) => void;
  deleteAllWords: () => void;
  setCurrentWordIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSettings: (settings: DictationSettings) => void;
  closeSnackbar: () => void;
}

export const DictationContext = createContext<DictationContextType>({
  wordSets: [],
  currentWordIndex: 0,
  isPlaying: false,
  settings: {
    repetitions: 2,
    interval: 2,
    speed: 1,
    pronunciation: 'English',
    language: 'English'
  },
  snackbarOpen: false,
  snackbarMessage: '',
  setWordSets: () => {},
  addWordSet: () => {},
  deleteWord: () => {},
  deleteAllWords: () => {},
  setCurrentWordIndex: () => {},
  setIsPlaying: () => {},
  setSettings: () => {},
  closeSnackbar: () => {}
});

const APP_USERS_KEY = 'appUsers'; // Consistent key with AuthContext

export const DictationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const { user, isAuthenticated, loadUserPhrases } = useAuth(); // Use auth context

  const [wordSets, setWordSets] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Effect for Loading/Clearing Phrases based on authentication state
  useEffect(() => {
    if (user && isAuthenticated) {
      const userPhrases = loadUserPhrases();
      setWordSets(userPhrases);
    } else {
      setWordSets([]); // Clear phrases if no user or logged out
    }
  }, [user, isAuthenticated, loadUserPhrases]);

  // Effect for Saving Phrases to localStorage when wordSets or user changes
  useEffect(() => {
    // Only save if there's a logged-in user.
    // This ensures that if wordSets is cleared due to logout, it doesn't try to save
    // an empty array for a non-existent user.
    if (user && isAuthenticated) {
      try {
        const appUsersString = localStorage.getItem(APP_USERS_KEY);
        const appUsers = appUsersString ? JSON.parse(appUsersString) : [];
        const userIndex = appUsers.findIndex((u: any) => u.userId === user.userId);

        if (userIndex !== -1) {
          // Check if phrases actually changed to avoid unnecessary writes
          if (JSON.stringify(appUsers[userIndex].phrases) !== JSON.stringify(wordSets)) {
            appUsers[userIndex].phrases = wordSets;
            localStorage.setItem(APP_USERS_KEY, JSON.stringify(appUsers));
          }
        } else {
          // This case should ideally not happen if user is authenticated
          // and AuthContext correctly manages appUsers.
          // console.warn("DictationContext: User not found in appUsers during save.");
        }
      } catch (error) {
        console.error("DictationContext: Failed to save phrases to localStorage", error);
      }
    }
  }, [wordSets, user, isAuthenticated]);


  const getDefaultPronunciation = useCallback(() => {
    switch (i18n.language) {
      case 'zh-CN':
        return 'Mandarin';
      case 'zh-TW':
        return 'Cantonese';
      default:
        return 'English';
    }
  }, [i18n.language]);

  const [settings, setSettings] = useState<DictationSettings>({
    repetitions: 2,
    interval: 2,
    speed: 1,
    pronunciation: getDefaultPronunciation(),
    language: i18n.language
  });

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      pronunciation: getDefaultPronunciation(),
      language: i18n.language
    }));
  }, [i18n.language, getDefaultPronunciation]);

  const deleteWord = (index: number) => {
    setWordSets(prev => prev.filter((_, i) => i !== index));
    setSnackbarMessage(t('Word deleted')); // Example of specific message
    setSnackbarOpen(true);
  };

  const deleteAllWords = () => {
    setWordSets([]);
    setSnackbarMessage(t('All words deleted'));
    setSnackbarOpen(true);
  };
  
  const addWordSet = (newWords: Word[]) => {
    setWordSets(prev => [...prev, ...newWords]);
    setSnackbarMessage(t('Words added successfully'));
    setSnackbarOpen(true);
  };

  const closeSnackbar = () => setSnackbarOpen(false);

  // Exposing the direct setWordSets for flexibility if needed,
  // but actions like add/delete should be preferred for clarity and side effects (like snackbar).
  const contextValue = {
    wordSets,
    currentWordIndex,
    isPlaying,
    settings,
    snackbarOpen,
    snackbarMessage,
    setWordSets, // Direct setter
    addWordSet,
    deleteWord,
    deleteAllWords,
    setCurrentWordIndex,
    setIsPlaying,
    setSettings,
    closeSnackbar
  };

  return (
    <DictationContext.Provider value={contextValue}>
      {children}
      <Snackbar
        message={snackbarMessage} // Use dynamic message
        isOpen={snackbarOpen}
        onClose={closeSnackbar}
        duration={2000}
      />
    </DictationContext.Provider>
  );
};

export const useDictation = () => {
  const context = useContext(DictationContext);
  if (!context) {
    throw new Error('useDictation must be used within a DictationProvider');
  }
  return context;
};