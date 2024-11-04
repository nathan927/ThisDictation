import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const DictationPlayer: React.FC = () => {
  const { t } = useTranslation();
  const [wordSets, setWordSets] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const handleDelete = () => {
    if (wordSets.length > 0) {
      const newWordSets = [...wordSets];
      newWordSets.splice(currentWordIndex, 1);
      setWordSets(newWordSets);
      if (currentWordIndex >= newWordSets.length) {
        setCurrentWordIndex(Math.max(0, newWordSets.length - 1));
      }
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm(t('Are you sure you want to delete all words?'))) {
      setWordSets([]);
      setCurrentWordIndex(0);
    }
  };

  return (
    // Your existing code here
  );
};

export default DictationPlayer;
