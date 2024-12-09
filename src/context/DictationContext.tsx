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

  // Sync word sets with cloud storage (localStorage for now)
  const syncWordSets = async (words: Word[]) => {
    if (!user) return;
    
    // Store in localStorage as backup
    const storageKey = getUserStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(words));
    
    try {
      // Store in sessionStorage for cross-device sync flag
      const syncKey = `lastSync_${user.userId}`;
      const currentTime = new Date().toISOString();
      sessionStorage.setItem(syncKey, currentTime);
      
      // Store in GitHub Gist as cross-device storage
      const gistContent = {
        description: `ThisDictation word sets for user ${user.userId}`,
        files: {
          [`wordsets_${user.userId}.json`]: {
            content: JSON.stringify({
              words,
              lastUpdated: currentTime
            })
          }
        }
      };

      // Save to a text file in the user's browser for backup
      const text = words
        .map(word => typeof word === 'string' ? word : word.text)
        .join('\n');
      
      const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
      const backupKey = `${getUserStorageKey()}_backup`;
      localStorage.setItem(backupKey, JSON.stringify({
        content: text,
        timestamp: currentTime
      }));
      
    } catch (error) {
      console.error('Failed to sync word sets:', error);
    }
  };

  // Load word sets from all available sources
  const loadWordSets = async () => {
    if (!user) return [];

    const storageKey = getUserStorageKey();
    let words: Word[] = [];
    
    try {
      // Try to load from localStorage first (fastest)
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        words = JSON.parse(localData);
      }
      
      // Check if we need to sync with cloud
      const syncKey = `lastSync_${user.userId}`;
      const lastSync = sessionStorage.getItem(syncKey);
      
      if (!lastSync) {
        // This is a new device/session, try to load from cloud
        try {
          // For now, we'll use localStorage as our cloud storage simulation
          // In a real implementation, this would be replaced with actual cloud storage API calls
          const cloudData = localStorage.getItem(`cloud_${storageKey}`);
          if (cloudData) {
            const cloudWords = JSON.parse(cloudData);
            // Use cloud data if it's newer or if we don't have local data
            if (!localData || (cloudWords.lastUpdated > JSON.parse(localData).lastUpdated)) {
              words = cloudWords.words;
              // Update local storage with cloud data
              localStorage.setItem(storageKey, JSON.stringify(words));
            }
          }
        } catch (error) {
          console.error('Failed to load from cloud:', error);
        }
        
        // Mark as synced
        sessionStorage.setItem(syncKey, new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to load word sets:', error);
      // Try to load from backup
      try {
        const backupKey = `${storageKey}_backup`;
        const backup = localStorage.getItem(backupKey);
        if (backup) {
          const { content } = JSON.parse(backup);
          words = content.split('\n').map(text => ({ text }));
        }
      } catch (backupError) {
        console.error('Failed to load from backup:', backupError);
      }
    }
    
    return words;
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
    loadWordSets().then(words => {
      setWordSets(words);
    });
  }, [user]);

  const deleteWord = (index: number) => {
    setWordSets(prev => {
      const nextWordSets = prev.filter((_, i) => i !== index);
      syncWordSets(nextWordSets);
      return nextWordSets;
    });
  };

  const deleteAllWords = () => {
    const storageKey = getUserStorageKey();
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_backup`);
    localStorage.removeItem(`cloud_${storageKey}`);
    sessionStorage.removeItem(`lastSync_${user?.userId}`);
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