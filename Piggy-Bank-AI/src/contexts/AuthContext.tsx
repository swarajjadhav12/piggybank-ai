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
  logout: () => void;
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
      const token = apiService.getToken();
      if (token) {
        const response = await apiService.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          apiService.clearToken();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiService.clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      if (response.success && response.data?.user) {
        setUser(response.data.user);
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
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
  };

  const updateProfile = async (profileData: { firstName?: string; lastName?: string }) => {
    try {
      const response = await apiService.updateProfile(profileData);
      if (response.success && response.data) {
        setUser(response.data);
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
