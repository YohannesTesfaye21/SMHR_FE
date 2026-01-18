'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { LoginRequest, LoginResponse } from '@/types/apiTypes';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface AuthContextType {
  user: LoginResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load auth state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          try {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          } catch (error) {
            console.error('Error loading auth state:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      const loginData = response.data;

      // Store auth data
      setToken(loginData.token);
      setUser(loginData.user);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', loginData.token);
        if (loginData.refreshToken) {
          localStorage.setItem('refresh_token', loginData.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(loginData.user));
      }

      // Redirect to admin page after successful login
      router.push('/admin');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
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