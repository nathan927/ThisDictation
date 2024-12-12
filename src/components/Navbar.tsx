import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { t } = useTranslation();

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="text-2xl font-bold text-gray-800">
                            {t('ThisDictation Helper')}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-gray-600">
                                    {t('Welcome')}, {user?.userId}
                                </span>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    {t('Logout')}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="px-4 py-2 font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {t('Login')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </nav>
    );
};

export default Navbar;