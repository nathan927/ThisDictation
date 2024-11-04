import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DictationSettings {
  repetitions: number;
  interval: number;
  speed: number;
  pronunciation: string;
}

interface DictationContextType {
  wordSets: Array<string | { text: string; audioUrl?: string }>;
  currentWordIndex: number;
  isPlaying: boolean;
  settings: DictationSettings;
  setWordSets: (newWordsOrUpdater: Array<string | { text: string; audioUrl?: string }> | 
    ((prev: Array<string | { text: string; audioUrl?: string }>) => Array<string | { text: string; audioUrl?: string }>)) => void;
  setCurrentWordIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSettings: (settings: DictationSettings) => void;
}

const DictationContext = createContext<DictationContextType | null>(null);

export const DictationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [wordSets, setWordSets] = useState<Array<string | { text: string; audioUrl?: string }>>([]);
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

  const value = {
    wordSets,
    currentWordIndex,
    isPlaying,
    settings,
    setWordSets: (newWordsOrUpdater: Array<string | { text: string; audioUrl?: string }> | 
      ((prev: Array<string | { text: string; audioUrl?: string }>) => Array<string | { text: string; audioUrl?: string }>)) => {
      if (typeof newWordsOrUpdater === 'function') {
        setWordSets(newWordsOrUpdater);
      } else {
        // Append new words to existing ones instead of replacing
        setWordSets(prevWords => [...prevWords, ...newWordsOrUpdater]);
      }
    },
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