import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (profileData: { firstName?: string; lastName?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await apiService.getToken();
            if (token) {
                try {
                    const response = await apiService.getProfile();
                    if (response.success && response.data) {
                        setUser(response.data as User);
                    } else {
                        await apiService.clearToken();
                    }
                } catch (apiError) {
                    // Network error or API unreachable - just clear token and continue
                    console.log('Could not verify auth token, clearing...');
                    await apiService.clearToken();
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            // Always set loading to false so app can render
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await apiService.login({ email, password });
            if (response.success) {
                // After login, fetch the user profile
                const profileResponse = await apiService.getProfile();
                if (profileResponse.success && profileResponse.data) {
                    setUser(profileResponse.data as User);
                } else {
                    throw new Error('Failed to fetch user profile');
                }
            } else {
                throw new Error(response.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (userData: { email: string; password: string; firstName?: string; lastName?: string }) => {
        try {
            const response = await apiService.register(userData);
            if (response.success) {
                // After registration, fetch the user profile
                const profileResponse = await apiService.getProfile();
                if (profileResponse.success && profileResponse.data) {
                    setUser(profileResponse.data as User);
                } else {
                    throw new Error('Failed to fetch user profile');
                }
            } else {
                throw new Error(response.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        await apiService.clearToken();
        setUser(null);
    };

    const updateProfile = async (profileData: { firstName?: string; lastName?: string }) => {
        try {
            const response = await apiService.updateProfile(profileData);
            if (response.success && response.data) {
                setUser(response.data as User);
            } else {
                throw new Error(response.error || 'Profile update failed');
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
