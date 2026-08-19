import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/api.types';
import { frontendAuthService } from '../services/auth.service';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string, token?: string) => Promise<void>;
  updateProfile: (data: { fullName?: string; avatarUrl?: string | null }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function getErrorMessage(err: unknown, defaultMessage: string): string {
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
    return errorObj.response?.data?.message || errorObj.message || defaultMessage;
  }
  return defaultMessage;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await frontendAuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        return;
      }

      // Fallback: load user details from Supabase active session if backend sync is pending
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isGoogle = session.user.app_metadata?.['provider'] === 'google';
        const fullName = (session.user.user_metadata?.['full_name'] as string) || (session.user.user_metadata?.['name'] as string) || null;
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName,
          name: fullName,
          avatarUrl: (session.user.user_metadata?.['avatar_url'] as string) || (session.user.user_metadata?.['picture'] as string) || null,
          emailVerified: Boolean(session.user.email_confirmed_at),
          authProvider: isGoogle ? 'GOOGLE' : 'EMAIL',
          provider: isGoogle ? 'GOOGLE' : 'EMAIL',
          role: 'USER',
          createdAt: session.user.created_at,
          updatedAt: session.user.created_at,
        });
      } else {
        setUser(null);
      }
    } catch {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isGoogle = session.user.app_metadata?.['provider'] === 'google';
          const fullName = (session.user.user_metadata?.['full_name'] as string) || (session.user.user_metadata?.['name'] as string) || null;
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName,
            name: fullName,
            avatarUrl: (session.user.user_metadata?.['avatar_url'] as string) || (session.user.user_metadata?.['picture'] as string) || null,
            emailVerified: Boolean(session.user.email_confirmed_at),
            authProvider: isGoogle ? 'GOOGLE' : 'EMAIL',
            provider: isGoogle ? 'GOOGLE' : 'EMAIL',
            role: 'USER',
            createdAt: session.user.created_at,
            updatedAt: session.user.created_at,
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    // Listen to Supabase auth changes (e.g. OAuth callback, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('access_token');
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const sessionData = await frontendAuthService.login(email, password);
      setUser(sessionData.user);
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Login failed');
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const sessionData = await frontendAuthService.register(email, password, fullName);
      if (sessionData.user) {
        setUser(sessionData.user);
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Registration failed');
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await frontendAuthService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await frontendAuthService.forgotPassword(email);
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Forgot password request failed');
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (password: string, token?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await frontendAuthService.resetPassword(password, token);
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Reset password failed');
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: { fullName?: string; avatarUrl?: string | null }) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await frontendAuthService.updateProfile(data);
      setUser(updatedUser);
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Profile update failed');
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      await frontendAuthService.signInWithGoogle();
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Google sign-in failed');
      setError(message);
      throw new Error(message);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        clearError,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
