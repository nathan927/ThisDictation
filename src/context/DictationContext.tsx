import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const [wordSets, setWordSets] = useState<Word[]>([]);
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

  const deleteWord = (index: number) => {
    setWordSets(prev => prev.filter((_, i) => i !== index));
  };

  const deleteAllWords = () => {
    setWordSets([]);
  };

  const closeSnackbar = () => setSnackbarOpen(false);

  const wrappedSetWordSets = (newWordSets: React.SetStateAction<Word[]>) => {
    setWordSets(newWordSets);
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
        message={t('Update Successful')}
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