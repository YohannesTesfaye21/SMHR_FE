import apiClient from '@/lib/apiClient';
import { LoginRequest, LoginApiResponse } from '@/types/apiTypes';

export const authService = {
  login: async (credentials: LoginRequest) => {
    return apiClient.post<LoginRequest, LoginApiResponse>('/api/Auth/login', credentials);
  },

  logout: async () => {
    // Clear token from storage if needed
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },
};