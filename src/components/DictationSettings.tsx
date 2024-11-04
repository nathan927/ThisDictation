import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';

const DictationSettings: React.FC = () => {
  const { t } = useTranslation();
  const { settings, setSettings } = useDictation();

  const handleSettingChange = (key: keyof typeof settings, value: number | string) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('Dictation Settings')}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('Number of Repetitions')}
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={settings.repetitions}
            onChange={(e) => handleSettingChange('repetitions', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('Reading Interval')}
          </label>
          <input
            type="number"
            min="0"
            max="30"
            value={settings.interval}
            onChange={(e) => handleSettingChange('interval', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('Reading Speed')}
          </label>
          <input
            type="number"
            min="0.5"
            max="3"
            step="0.1"
            value={settings.speed}
            onChange={(e) => handleSettingChange('speed', parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('Pronunciation')}
          </label>
          <select
            value={settings.pronunciation}
            onChange={(e) => handleSettingChange('pronunciation', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="English">{t('English')}</option>
            <option value="Cantonese">{t('Cantonese')}</option>
            <option value="Mandarin">{t('Mandarin')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DictationSettings;