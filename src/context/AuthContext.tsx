import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Snackbar from '../components/Snackbar';

interface User {
    userId: string;
}

interface AuthContextType {
    user: User | null;
    login: (userId: string, password: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

const users = {
    nathan: 'vip',
    ling: 'vip',
    jessica: 'vip',
    mike: 'vip',
    sam: 'vip',
    winnie: 'vip',
    phillip: 'vip',
    hung: 'vip',
    guojiajia: 'vip'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { t } = useTranslation();

    const login = (userId: string, password: string): boolean => {
        const validPassword = users[userId as keyof typeof users];
        
        if (validPassword && validPassword === password) {
            const userObj = { userId };
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
            setSnackbarMessage(t('Login Successfully'));
            setSnackbarOpen(true);
            return true;
        }
        setSnackbarMessage(t('Login Failed'));
        setSnackbarOpen(true);
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setSnackbarMessage(t('Logged out Already'));
        setSnackbarOpen(true);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            <Snackbar
                isOpen={snackbarOpen}
                message={snackbarMessage}
                onClose={() => setSnackbarOpen(false)}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
