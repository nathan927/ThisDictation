import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (login(userId, password)) {
            setUserId('');
            setPassword('');
            onSuccess?.();
            onClose();
        } else {
            setError(t('Invalid username or password'));
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md w-full rounded-2xl bg-white shadow-2xl transform transition-all">
                    <div className="relative">
                        {/* Header with decorative gradient */}
                        <div className="absolute inset-0 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-2xl" />
                        
                        {/* Login form */}
                        <div className="relative px-8 pt-16 pb-8">
                            {/* Welcome text */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">{t('Welcome back')}</h2>
                                <p className="text-blue-100">{t('Please enter your credentials')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                                <div className="bg-white rounded-xl p-6">
                                    <div className="space-y-6">
                                        {/* User ID input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('User ID')}
                                            </label>
                                            <input
                                                type="text"
                                                value={userId}
                                                onChange={(e) => setUserId(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white"
                                                required
                                            />
                                        </div>

                                        {/* Password input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('Password')}
                                            </label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white"
                                                required
                                            />
                                        </div>

                                        {/* Remember me checkbox */}
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="remember-me"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="h-4 w-4 text-teal-500 border-gray-300 rounded focus:ring-0"
                                            />
                                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                                                {t('Remember me')}
                                            </label>
                                        </div>

                                        {/* Error message */}
                                        {error && (
                                            <div className="text-red-500 text-sm text-center">
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-4 justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 text-gray-600 font-medium hover:text-gray-800 focus:outline-none transition-colors"
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-12 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white rounded-lg text-base font-medium focus:outline-none transform hover:scale-102 transition-all duration-500 hover:shadow-lg"
                                    >
                                        {t('Login')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
