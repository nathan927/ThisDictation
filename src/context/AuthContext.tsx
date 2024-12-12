import React, { createContext, useContext, useState, useEffect } from 'react';

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
    alan: 'vip',
    danny: 'vip'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (userId: string, password: string): boolean => {
        const validPassword = users[userId as keyof typeof users];
        
        if (validPassword && validPassword === password) {
            const userObj = { userId };
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
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
