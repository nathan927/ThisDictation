import React from 'react';
import { useTranslation } from 'react-i18next';

interface WordDisplayProps {
  currentWord?: { text: string } | string;
  currentIndex: number;
  totalWords: number;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  currentWord,
  currentIndex,
  totalWords
}) => {
  const { t } = useTranslation();
  
  const getText = (word?: { text: string } | string) => {
    if (!word) return t('No words added');
    return typeof word === 'string' ? word : word.text;
  };

  return (
    <div className="mb-4">
      <div className="text-center text-2xl font-bold mb-4">
        {getText(currentWord)}
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        {totalWords > 0 ? 
          `${Math.min(currentIndex + 1, totalWords)} ${t('of')} ${totalWords} ${t('word(s)')}` : 
          `0 ${t('of')} 0 ${t('word(s)')}`}
      </div>
    </div>
  );
};