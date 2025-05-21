import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    userId: string;
}

interface Word {
    text: string;
    audioUrl?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userId: string, password: string) => boolean;
    logout: () => void;
    register: (userId: string, password: string) => boolean;
    isAuthenticated: boolean;
    loadUserPhrases: () => Word[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const APP_USERS_KEY = 'appUsers';

function getAppUsers(): any[] {
    try {
        const storedUsers = localStorage.getItem(APP_USERS_KEY);
        return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
        console.error("Failed to parse appUsers from localStorage", error);
        return [];
    }
}

function saveAppUsers(users: any[]): void {
    try {
        localStorage.setItem(APP_USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Failed to save appUsers to localStorage", error);
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            return null;
        }
    });

    const register = (userId: string, password: string): boolean => {
        const appUsers = getAppUsers();
        const userExists = appUsers.find(u => u.userId === userId);
        if (userExists) {
            return false; // User already exists
        }
        const newUser = { userId, password, phrases: [] };
        appUsers.push(newUser);
        saveAppUsers(appUsers);
        const userObj = { userId };
        setUser(userObj);
        try {
            localStorage.setItem('user', JSON.stringify(userObj));
        } catch (error) {
            console.error("Failed to save user to localStorage during registration", error);
        }
        return true;
    };

    const login = (userId: string, password: string): boolean => {
        const appUsers = getAppUsers();
        const foundUser = appUsers.find(u => u.userId === userId && u.password === password);
        
        if (foundUser) {
            const userObj = { userId };
            setUser(userObj);
            try {
                localStorage.setItem('user', JSON.stringify(userObj));
            } catch (error) {
                console.error("Failed to save user to localStorage during login", error);
            }
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem('user');
        } catch (error) {
            console.error("Failed to remove user from localStorage during logout", error);
        }
    };

    const loadUserPhrases = (): Word[] => {
        if (!user) {
            return [];
        }
        const appUsers = getAppUsers();
        const currentUserData = appUsers.find(u => u.userId === user.userId);
        return currentUserData?.phrases || [];
    };

    const value = {
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        loadUserPhrases
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
