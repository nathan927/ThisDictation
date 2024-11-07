import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DictationSettings {
  repetitions: number;
  interval: number;
  speed: number;
  pronunciation: string;
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
  setWordSets: React.Dispatch<React.SetStateAction<Word[]>>;
  deleteWord: (index: number) => void;
  deleteAllWords: () => void;
  setCurrentWordIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSettings: (settings: DictationSettings) => void;
}

export const DictationContext = createContext<DictationContextType>({
  wordSets: [],
  currentWordIndex: 0,
  isPlaying: false,
  settings: {
    repetitions: 3,
    interval: 2,
    speed: 1,
    pronunciation: 'English'
  },
  setWordSets: () => {},
  deleteWord: () => {},
  deleteAllWords: () => {},
  setCurrentWordIndex: () => {},
  setIsPlaying: () => {},
  setSettings: () => {}
});

export const DictationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [wordSets, setWordSets] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
    pronunciation: getDefaultPronunciation()
  });

  // Update pronunciation when language changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      pronunciation: getDefaultPronunciation()
    }));
  }, [i18n.language]);

  const deleteWord = (index: number) => {
    setWordSets(prev => prev.filter((_, i) => i !== index));
  };

  const deleteAllWords = () => {
    setWordSets([]);
  };

  const value = {
    wordSets,
    currentWordIndex,
    isPlaying,
    settings,
    setWordSets: setWordSets,
    deleteWord,
    deleteAllWords,
    setCurrentWordIndex,
    setIsPlaying,
    setSettings
  };

  return (
    <DictationContext.Provider value={value}>
      {children}
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