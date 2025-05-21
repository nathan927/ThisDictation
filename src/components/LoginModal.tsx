import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Snackbar from './Snackbar';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // Kept for login mode
    const { login, register } = useAuth();
    const { t } = useTranslation();
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Reset form state when modal is closed or mode changes
    useEffect(() => {
        if (!isOpen) {
            setUserId('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setSnackbarMessage('');
            setMode('login'); // Reset to login mode when re-opened
        }
    }, [isOpen]);

    const resetFormFields = () => {
        setUserId('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSnackbarMessage('');
    };

    const handleModeChange = (newMode: 'login' | 'register') => {
        resetFormFields();
        setMode(newMode);
    };
    
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSnackbarMessage('');

        if (login(userId, password)) {
            resetFormFields();
            setSnackbarMessage(t('Login successful!')); // Optional success message
            setSnackbarOpen(true);
            onSuccess?.();
            onClose(); 
        } else {
            setError(t('Invalid username or password'));
            setSnackbarMessage(t('Invalid username or password'));
            setSnackbarOpen(true);
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSnackbarMessage('');

        if (password !== confirmPassword) {
            setError(t('Passwords do not match'));
            setSnackbarMessage(t('Passwords do not match'));
            setSnackbarOpen(true);
            return;
        }

        if (register(userId, password)) {
            resetFormFields();
            setSnackbarMessage(t('Registration successful! You can now log in.'));
            setSnackbarOpen(true);
            // Decide if auto-login:
            // Option 1: Auto-login (call login and then onSuccess)
            // if (login(userId, password)) {
            //   onSuccess?.();
            // }
            // Option 2: Just close and let user login manually
            // For now, let's switch to login mode and inform the user
            handleModeChange('login');
            // onSuccess?.(); // Call if registration implies login
            // onClose(); // Keep modal open to show success and switch to login
        } else {
            setError(t('Username already taken'));
            setSnackbarMessage(t('Username already taken'));
            setSnackbarOpen(true);
        }
    };
    
    const currentSubmitHandler = mode === 'login' ? handleLoginSubmit : handleRegisterSubmit;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md w-full rounded-2xl bg-white shadow-2xl transform transition-all">
                    <div className="relative">
                        <div className="absolute inset-0 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-2xl" />
                        
                        <div className="relative px-8 pt-10 pb-8">
                            {/* Mode Switcher */}
                            <div className="flex justify-center mb-6">
                                <button
                                    onClick={() => handleModeChange('login')}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-md transition-colors
                                        ${mode === 'login' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {t('Login')}
                                </button>
                                <button
                                    onClick={() => handleModeChange('register')}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-md transition-colors
                                        ${mode === 'register' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {t('Register')}
                                </button>
                            </div>
                            
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {mode === 'login' ? t('Welcome back') : t('Create an account')}
                                </h2>
                                <p className="text-blue-100">
                                    {mode === 'login' ? t('Please enter your credentials') : t('Fill in the details to register')}
                                </p>
                            </div>

                            <form onSubmit={currentSubmitHandler} className="space-y-6 pt-4">
                                <div className="bg-white rounded-xl p-6">
                                    <div className="space-y-6">
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

                                        {mode === 'register' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('Confirm Password')}
                                                </label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white"
                                                    required
                                                />
                                            </div>
                                        )}

                                        {mode === 'login' && (
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
                                        )}

                                        {error && (
                                            <div className="text-red-500 text-sm text-center">
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                </div>

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
                                        {mode === 'login' ? t('Login') : t('Register')}
                                    </button>
                                </div>
                                { mode === 'login' ? (
                                    <p className="text-sm text-center text-gray-600">
                                        {t("Don't have an account?")}{' '}
                                        <button type="button" onClick={() => handleModeChange('register')} className="font-medium text-teal-600 hover:text-teal-500">
                                            {t('Register here')}
                                        </button>
                                    </p>
                                 ) : (
                                    <p className="text-sm text-center text-gray-600">
                                        {t('Already have an account?')}{' '}
                                        <button type="button" onClick={() => handleModeChange('login')} className="font-medium text-teal-600 hover:text-teal-500">
                                            {t('Login here')}
                                        </button>
                                    </p>
                                 )}
                            </form>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
            <Snackbar
                message={snackbarMessage}
                isOpen={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                isError={!!error} // Pass error status to Snackbar
            />
        </Dialog>
    );
}
