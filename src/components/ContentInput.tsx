import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';
import VoiceUploadModal from './VoiceUploadModal';
import ImageUploadModal from './ImageUploadModal';
import ImportTxtButton from './ImportTxtButton';

const ContentInput: React.FC = () => {
  const { t } = useTranslation();
  const { setWordSets } = useDictation();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAreaRef.current?.value.trim()) {
      alert(t('Please provide the words'));
      return;
    }
    
    const newWords = textAreaRef.current.value
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0)
      .map(text => ({ text }));
    setWordSets(prevWords => [...prevWords, ...newWords]);
    if (textAreaRef.current) {
      textAreaRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const words = text.split('\n')
          .map(word => word.trim())
          .filter(word => word.length > 0)
          .map(text => ({ text }));
        setWordSets(prevWords => [...prevWords, ...words]);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const buttonBaseClass = "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-white text-center";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('Content Input')}</h2>
      
      <div className="mb-4">
        <textarea
          ref={textAreaRef}
          className="w-full h-32 p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('Enter words (one per line)')}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <button
          onClick={handleSubmit}
          className={`${buttonBaseClass} bg-gradient-to-r from-blue-500 to-blue-600`}
        >
          {t('Text Upload')}
        </button>

        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`${buttonBaseClass} bg-gradient-to-r from-purple-500 to-purple-600`}
        >
          {t('Import txt file')}
        </button>

        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className={`${buttonBaseClass} bg-gradient-to-r from-green-500 to-green-600`}
        >
          {t('Voice Upload')}
        </button>

        <button
          onClick={() => setIsImageModalOpen(true)}
          className={`${buttonBaseClass} bg-gradient-to-r from-orange-500 to-orange-600`}
        >
          {t('Image Upload')}
        </button>
      </div>

      <VoiceUploadModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onConfirm={(text) => {
          const words = text
            .split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0)
            .map(text => ({ text }));
          setWordSets(words);
          setIsImageModalOpen(false);
        }}
      />
    </div>
  );
};

export default ContentInput;