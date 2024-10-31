import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import UserGuide from './UserGuide';

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {t('ThisDictation Helper')}
      </h1>
      <div className="flex items-center gap-4">
        <LanguageSelector />
        <UserGuide />
      </div>
    </div>
  );
};

export default Header; 