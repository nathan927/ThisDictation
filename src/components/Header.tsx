import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import UserGuide from './UserGuide';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-4 px-4">
      <div className="flex-shrink-0 pt-2 pb-4">
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-[shimmer_2s_linear_infinite] whitespace-nowrap">
          {t('ThisDictation Helper')}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <LanguageSelector />
        <UserGuide />
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-6">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent text-sm sm:text-lg font-bold animate-gradient hover:scale-105 transition-transform duration-300 px-1">
              {t('Welcome')}, {user?.userId}
            </span>
            <button
              onClick={handleLogout}
              className="group relative px-4 sm:px-6 py-2 bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-500 text-white rounded-lg text-sm font-extrabold tracking-wide focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transform hover:scale-105 transition-all duration-500 shadow-[0_0_20px_rgba(100,116,139,0.5)] hover:shadow-[0_0_25px_rgba(82,82,91,0.5)] overflow-hidden"
            >
              <span className="relative z-10 group-hover:animate-[pulse_2s_ease-in-out_infinite]">{t('Logout')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-600 via-gray-600 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20">
                <div className="absolute inset-0 bg-white transform rotate-45 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-[1500ms]"></div>
              </div>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="group relative px-4 sm:px-6 py-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white rounded-lg text-sm font-extrabold tracking-wide focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-500 shadow-[0_0_20px_rgba(20,184,166,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] overflow-hidden"
          >
            <span className="relative z-10 group-hover:animate-[pulse_2s_ease-in-out_infinite]">{t('Login')}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20">
              <div className="absolute inset-0 bg-white transform rotate-45 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-[1500ms]"></div>
            </div>
          </button>
        )}
      </div>
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default Header;