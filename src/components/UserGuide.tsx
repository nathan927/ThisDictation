import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

const UserGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white font-bold text-base flex items-center justify-center transform hover:scale-110 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        aria-label={t('Guide')}
      >
        <span className="relative z-10">?</span>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-violet-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 via-indigo-500 to-violet-400 rounded-full opacity-0 group-hover:opacity-40 blur-sm transition-opacity duration-300"></div>
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <Dialog.Title className="text-2xl font-bold mb-6 text-gray-800">
              {t('Welcome to ThisDictation Helper!')}
            </Dialog.Title>

            <div className="prose prose-lg">
              <p className="mb-4">
                {t('user_guide.introduction')}
              </p>

              <h3 className="text-lg font-semibold mb-2">{t('Key Features:')}</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>{t('user_guide.feature_1')}</li>
                <li>{t('user_guide.feature_2')}</li>
                <li>{t('user_guide.feature_3')}</li>
                <li>{t('user_guide.feature_4')}</li>
                <li>{t('user_guide.feature_5')}</li>
              </ul>

              <p className="mb-4">
                {t('user_guide.getting_started')}
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-lg hover:from-violet-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-200 font-medium"
              >
                {t('Got it!')}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default UserGuide;