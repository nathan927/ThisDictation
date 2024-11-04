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
        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
      >
        {t('Guide')}
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl rounded bg-white p-6">
            <Dialog.Title className="text-2xl font-bold mb-4">
              {t('Welcome to ThisDictation Helper!')}
            </Dialog.Title>

            <div className="prose">
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

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              {t('Got it!')}
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default UserGuide;