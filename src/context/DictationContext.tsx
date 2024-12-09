import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext'; 
import Snackbar from '../components/Snackbar';

interface DictationSettings {
  repetitions: number;
  interval: number;
  speed: number;
  pronunciation: string;
  language: string;
}

interface Word {
  text: string;
  audioUrl?: string;
}

interface DictationContextType {
  wordSets: Word[];
  currentWordIndex: number;
  isPlaying: boolean;
  settings: DictationSettings;
  snackbarOpen: boolean;
  setWordSets: React.Dispatch<React.SetStateAction<Word[]>>;
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
    repetitions: 3,
    interval: 2,
    speed: 1,
    pronunciation: 'English',
    language: 'English'
  },
  snackbarOpen: false,
  setWordSets: () => {},
  deleteWord: () => {},
  deleteAllWords: () => {},
  setCurrentWordIndex: () => {},
  setIsPlaying: () => {},
  setSettings: () => {},
  closeSnackbar: () => {}
});

export const DictationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();

  // Get user-specific storage key
  const getUserStorageKey = () => {
    return user ? `wordSets_${user.userId}` : 'wordSets_guest';
  };

  // Auto-save function
  const saveToFile = (words: Word[]) => {
    if (!user) return;
    
    const text = words
      .map(word => typeof word === 'string' ? word : word.text)
      .join('\n');
    
    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
    const fileName = `${user.userId}_wordsets_${new Date().toISOString().split('T')[0]}.txt`;
    
    // Save to localStorage with filename reference
    localStorage.setItem(`${getUserStorageKey()}_backup`, JSON.stringify({
      fileName,
      content: text,
      timestamp: new Date().toISOString()
    }));
  };

  const [wordSets, setWordSets] = useState<Word[]>(() => {
    const storageKey = getUserStorageKey();
    const savedWordSets = localStorage.getItem(storageKey);
    return savedWordSets ? JSON.parse(savedWordSets) : [];
  });
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const getDefaultPronunciation = () => {
    switch (i18n.language) {
      case 'zh-CN':
        return 'Mandarin';
      case 'zh-TW':
        return 'Cantonese';
      default:
        return 'English';
    }
  };

  const [settings, setSettings] = useState<DictationSettings>({
    repetitions: 3,
    interval: 2,
    speed: 1,
    pronunciation: getDefaultPronunciation(),
    language: i18n.language
  });

  // Update pronunciation when language changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      pronunciation: getDefaultPronunciation(),
      language: i18n.language
    }));
  }, [i18n.language]);

  // Update word sets when user changes
  useEffect(() => {
    const storageKey = getUserStorageKey();
    const savedWordSets = localStorage.getItem(storageKey);
    if (savedWordSets) {
      setWordSets(JSON.parse(savedWordSets));
    } else {
      setWordSets([]);
    }
  }, [user]);

  const deleteWord = (index: number) => {
    setWordSets(prev => {
      const nextWordSets = prev.filter((_, i) => i !== index);
      const storageKey = getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(nextWordSets));
      return nextWordSets;
    });
  };

  const deleteAllWords = () => {
    const storageKey = getUserStorageKey();
    localStorage.removeItem(storageKey);
    setWordSets([]);
  };

  const closeSnackbar = () => setSnackbarOpen(false);

  const wrappedSetWordSets = (newWordSets: React.SetStateAction<Word[]>) => {
    setWordSets(prev => {
      const nextWordSets = typeof newWordSets === 'function' ? newWordSets(prev) : newWordSets;
      const storageKey = getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(nextWordSets));
      
      // Auto-save to file
      saveToFile(nextWordSets);
      
      return nextWordSets;
    });
    setSnackbarOpen(true);
  };

  return (
    <DictationContext.Provider
      value={{
        wordSets,
        currentWordIndex,
        isPlaying,
        settings,
        snackbarOpen,
        setWordSets: wrappedSetWordSets,
        deleteWord,
        deleteAllWords,
        setCurrentWordIndex,
        setIsPlaying,
        setSettings,
        closeSnackbar
      }}
    >
      {children}
      <Snackbar
        message={t('Update Successfully')}
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