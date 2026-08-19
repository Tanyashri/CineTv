import { apiClient } from './api.service';
import { supabase } from './supabase';
import type { ApiResponse, User } from '../types/api.types';

export interface AuthSessionData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export class FrontendAuthService {
  async register(email: string, password: string, fullName?: string): Promise<AuthSessionData> {
    const response = await apiClient.post<ApiResponse<AuthSessionData>>('/auth/register', {
      email,
      password,
      fullName,
    });
    const session = response.data.data;
    if (session.accessToken) {
      localStorage.setItem('access_token', session.accessToken);
      if (session.refreshToken) {
        try {
          await supabase.auth.setSession({
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
          });
        } catch {
          // Ignore setSession fallback errors
        }
      }
    }
    return session;
  }

  async login(email: string, password: string): Promise<AuthSessionData> {
    const response = await apiClient.post<ApiResponse<AuthSessionData>>('/auth/login', {
      email,
      password,
    });
    const session = response.data.data;
    if (session.accessToken) {
      localStorage.setItem('access_token', session.accessToken);
      if (session.refreshToken) {
        try {
          await supabase.auth.setSession({
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
          });
        } catch {
          // Ignore setSession fallback errors
        }
      }
    }
    return session;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem('access_token');
      await supabase.auth.signOut();
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(password: string, token?: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { password, token });
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      return response.data.data.user;
    } catch {
      localStorage.removeItem('access_token');
      return null;
    }
  }

  async updateProfile(data: { fullName?: string; avatarUrl?: string | null }): Promise<User> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data.data.user;
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw error;
  }
}

export const frontendAuthService = new FrontendAuthService();
