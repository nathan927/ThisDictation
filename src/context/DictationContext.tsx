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

  // Get user-specific storage key for cloud storage
  const getCloudStorageKey = () => {
    return user ? `cloud_wordSets_${user.userId}` : null;
  };

  // Sync word sets with cloud storage
  const syncWordSets = async (words: Word[]) => {
    if (!user) return;
    
    const cloudKey = getCloudStorageKey();
    if (!cloudKey) return;

    const currentTime = new Date().toISOString();
    
    // Store in cloud storage (using localStorage as simulation)
    const cloudData = {
      words,
      lastUpdated: currentTime,
      userId: user.userId
    };
    
    // Save to cloud
    localStorage.setItem(cloudKey, JSON.stringify(cloudData));
    
    // Also save locally for faster access
    const localKey = getUserStorageKey();
    localStorage.setItem(localKey, JSON.stringify(words));
    
    // Save backup
    const backupKey = `${localKey}_backup`;
    const text = words
      .map(word => typeof word === 'string' ? word : word.text)
      .join('\n');
    
    localStorage.setItem(backupKey, JSON.stringify({
      content: text,
      timestamp: currentTime
    }));
  };

  // Load word sets from cloud storage
  const loadWordSets = async () => {
    if (!user) return [];

    const cloudKey = getCloudStorageKey();
    if (!cloudKey) return [];
    
    try {
      // Try to load from cloud storage
      const cloudData = localStorage.getItem(cloudKey);
      if (cloudData) {
        const { words } = JSON.parse(cloudData);
        // Update local storage with cloud data
        const localKey = getUserStorageKey();
        localStorage.setItem(localKey, JSON.stringify(words));
        return words;
      }
    } catch (error) {
      console.error('Failed to load from cloud:', error);
      // Try to load from local storage as fallback
      const localKey = getUserStorageKey();
      const localData = localStorage.getItem(localKey);
      if (localData) {
        return JSON.parse(localData);
      }
    }
    
    return [];
  };

  const [wordSets, setWordSets] = useState<Word[]>(() => {
    // Initially load from local storage for faster startup
    const localKey = getUserStorageKey();
    const savedWordSets = localStorage.getItem(localKey);
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

  // Load from cloud when user changes or component mounts
  useEffect(() => {
    if (user) {
      loadWordSets().then(words => {
        if (words && words.length > 0) {
          setWordSets(words);
        }
      });
    } else {
      setWordSets([]);
    }
  }, [user]);

  const deleteWord = (index: number) => {
    setWordSets(prev => {
      const nextWordSets = prev.filter((_, i) => i !== index);
      syncWordSets(nextWordSets);
      return nextWordSets;
    });
  };

  const deleteAllWords = () => {
    if (!user) return;

    const localKey = getUserStorageKey();
    const cloudKey = getCloudStorageKey();
    
    // Clear all storage locations
    if (cloudKey) {
      localStorage.removeItem(cloudKey);
    }
    localStorage.removeItem(localKey);
    localStorage.removeItem(`${localKey}_backup`);
    
    setWordSets([]);
  };

  const closeSnackbar = () => setSnackbarOpen(false);

  const wrappedSetWordSets = (newWordSets: React.SetStateAction<Word[]>) => {
    setWordSets(prev => {
      const nextWordSets = typeof newWordSets === 'function' ? newWordSets(prev) : newWordSets;
      syncWordSets(nextWordSets);
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