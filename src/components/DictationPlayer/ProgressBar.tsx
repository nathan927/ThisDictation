import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  currentIndex: number;
  totalWords: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentIndex,
  totalWords
}) => {
  const { t } = useTranslation();
  const progress = totalWords > 0 ? 
    (Math.min(currentIndex, totalWords - 1) / (totalWords - 1)) * 100 : 0;

  return (
    <div className="mb-6 space-y-4">
      <div>
        <div className="h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-500 rounded transition-all duration-300" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        <div className="text-sm text-gray-500 text-center mt-1">
          {t('Word Progress')}
        </div>
      </div>
    </div>
  );
};