import { AuthProvider, Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { supabaseAdmin, supabaseClient } from '../config/supabase.js';
import { env } from '../config/env.js';
import { AuthMessages } from '../constants/messages.js';
import { AppError } from '../utils/app-error.js';
import { HttpStatus } from '../constants/http-status.js';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export class AuthService {
  /**
   * Synchronize a Supabase authenticated user into the Prisma User table.
   * Guarantees zero duplicate users by upserting on unique ID / email.
   */
  async syncUserToPrisma(
    supabaseUser: {
      id: string;
      email?: string | null;
      email_confirmed_at?: string | null;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    },
    defaultProvider: AuthProvider = AuthProvider.EMAIL,
  ): Promise<User> {
    if (!supabaseUser.email) {
      throw new Error('Supabase user email is missing');
    }

    const email = supabaseUser.email.toLowerCase().trim();
    const metadata = (supabaseUser.user_metadata || {}) as Record<string, string | undefined>;
    const appMetadata = (supabaseUser.app_metadata || {}) as Record<string, string | undefined>;

    const fullName = metadata['full_name'] || metadata['fullName'] || metadata['name'] || null;

    const avatarUrl = metadata['avatar_url'] || metadata['avatarUrl'] || metadata['picture'] || null;

    const emailVerified = Boolean(supabaseUser.email_confirmed_at);
    const provider =
      appMetadata['provider'] === 'google' || metadata['iss']?.includes('google')
        ? AuthProvider.GOOGLE
        : defaultProvider;

    // Check if user exists by ID or Email to prevent duplicate creation
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: supabaseUser.id }, { email }],
      },
    });

    if (existingUser) {
      return await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          id: supabaseUser.id, // align ID if found by email
          email,
          fullName: fullName ?? existingUser.fullName,
          name: fullName ?? existingUser.name,
          avatarUrl: avatarUrl ?? existingUser.avatarUrl,
          emailVerified: emailVerified || existingUser.emailVerified,
          authProvider: provider,
          provider: provider,
        },
      });
    }

    return await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email,
        fullName,
        name: fullName,
        avatarUrl,
        emailVerified,
        authProvider: provider,
        provider: provider,
        role: Role.USER,
      },
    });
  }

  /**
   * Register a new user with Email and Password.
   */
  async register(data: { email: string; password: string; fullName?: string }): Promise<AuthSession> {
    const { email, password, fullName } = data;

    const { data: authData, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new AppError(AuthMessages.EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT, 'EMAIL_ALREADY_EXISTS');
      }
      throw new AppError(error.message, HttpStatus.BAD_REQUEST, 'BAD_REQUEST');
    }

    if (!authData.user) {
      throw new AppError('Failed to create user account', HttpStatus.INTERNAL_SERVER_ERROR, 'REGISTRATION_FAILED');
    }

    const syncedUser = await this.syncUserToPrisma(
      {
        ...authData.user,
        user_metadata: {
          ...authData.user.user_metadata,
          full_name: fullName,
        },
      },
      AuthProvider.EMAIL,
    );

    return {
      accessToken: authData.session?.access_token ?? '',
      refreshToken: authData.session?.refresh_token ?? '',
      expiresIn: authData.session?.expires_in ?? 3600,
      user: syncedUser,
    };
  }

  /**
   * Login user with Email and Password.
   */
  async login(data: { email: string; password: string }): Promise<AuthSession> {
    const { email, password } = data;

    const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !authData.user || !authData.session) {
      throw new AppError(AuthMessages.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }

    const syncedUser = await this.syncUserToPrisma(authData.user, AuthProvider.EMAIL);

    return {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresIn: authData.session.expires_in,
      user: syncedUser,
    };
  }

  /**
   * Logout user session.
   */
  async logout(accessToken?: string): Promise<void> {
    if (accessToken) {
      await supabaseAdmin.auth.admin.signOut(accessToken);
    }
  }

  /**
   * Send Password Reset Email.
   */
  async forgotPassword(email: string): Promise<void> {
    const redirectTo = `${env.CORS_ORIGIN}/reset-password`;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Reset Password with new password for authenticated/recovery user.
   */
  async resetPassword(accessToken: string, newPassword: string): Promise<void> {
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !userData.user) {
      throw new Error(AuthMessages.TOKEN_INVALID);
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get current authenticated user profile from Prisma.
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(AuthMessages.UNAUTHORIZED);
    }

    return user;
  }

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, data: { fullName?: string; avatarUrl?: string | null }): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName, name: data.fullName } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
    });

    // Update Supabase metadata in background
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: updatedUser.fullName,
          avatar_url: updatedUser.avatarUrl,
        },
      });
    } catch {
      // Ignore background metadata update error
    }

    return updatedUser;
  }
}

export const authService = new AuthService();
