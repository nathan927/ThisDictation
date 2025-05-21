import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDictation } from '../context/DictationContext';
import { useAuth } from '../context/AuthContext'; // Corrected path
import VoiceUploadModal from './VoiceUploadModal';
import ImageUploadModal from './ImageUploadModal';
// ImportTxtButton seems unused in the provided snippet, but if it were part of the form, it would be disabled too.

const ContentInput: React.FC = () => {
  const { t } = useTranslation();
  const { setWordSets, addWordSet } = useDictation(); // Using addWordSet for snackbar consistency
  const { isAuthenticated } = useAuth();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert(t('Please log in to add phrases.')); // Should not happen if UI is disabled
      return;
    }
    if (!textAreaRef.current?.value.trim()) {
      alert(t('Please provide the words'));
      return;
    }
    
    const newWords = textAreaRef.current.value
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0)
      .map(text => ({ text }));
    addWordSet(newWords); // Use addWordSet from context
    if (textAreaRef.current) {
      textAreaRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) return; // Guard
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const words = text.split('\n')
          .map(word => word.trim())
          .filter(word => word.length > 0)
          .map(text => ({ text }));
        addWordSet(words); // Use addWordSet from context
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const buttonBaseClass = "px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-white text-center";
  const disabledButtonClass = "bg-gray-400 cursor-not-allowed";

  if (!isAuthenticated) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">{t('Content Input')}</h2>
        <p className="text-gray-600">{t('Please log in to add new phrases.')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('Content Input')}</h2>
      
      <div className="mb-4">
        <textarea
          ref={textAreaRef}
          className="w-full h-32 p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('Enter words (one per line)')}
          disabled={!isAuthenticated} // Technically redundant due to the main guard, but good for defense in depth
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <button
          onClick={handleSubmit}
          className={`${buttonBaseClass} ${isAuthenticated ? 'bg-gradient-to-r from-blue-500 to-blue-600' : disabledButtonClass}`}
          disabled={!isAuthenticated}
        >
          {t('Text Upload')}
        </button>

        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={!isAuthenticated}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`${buttonBaseClass} ${isAuthenticated ? 'bg-gradient-to-r from-purple-500 to-purple-600' : disabledButtonClass}`}
          disabled={!isAuthenticated}
        >
          {t('Import txt file')}
        </button>

        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className={`${buttonBaseClass} ${isAuthenticated ? 'bg-gradient-to-r from-green-500 to-green-600' : disabledButtonClass}`}
          disabled={!isAuthenticated}
        >
          {t('Voice Upload')}
        </button>

        <button
          onClick={() => setIsImageModalOpen(true)}
          className={`${buttonBaseClass} ${isAuthenticated ? 'bg-gradient-to-r from-orange-500 to-orange-600' : disabledButtonClass}`}
          disabled={!isAuthenticated}
        >
          {t('Image Upload')}
        </button>
      </div>

      {/* Modals should also ideally check isAuthenticated internally or not be triggerable */}
      <VoiceUploadModal
        isOpen={isVoiceModalOpen && isAuthenticated}
        onClose={() => setIsVoiceModalOpen(false)}
      />
      <ImageUploadModal
        isOpen={isImageModalOpen && isAuthenticated}
        onClose={() => setIsImageModalOpen(false)}
        onConfirm={(text) => {
          if (!isAuthenticated) return;
          const words = text
            .split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0)
            .map(text => ({ text }));
          addWordSet(words); // Use addWordSet
          setIsImageModalOpen(false);
        }}
      />
    </div>
  );
};

export default ContentInput;