import type { Request, Response } from 'express';
import { HttpStatus } from '../constants/http-status.js';
import { AuthMessages } from '../constants/messages.js';
import { authService } from './auth.service.js';
import { env } from '../config/env.js';

export class AuthController {
  /** POST /auth/register */
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, fullName } = req.body;
    const session = await authService.register({ email, password, fullName });

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: AuthMessages.REGISTER_SUCCESS,
      data: session,
    });
  }

  /** POST /auth/login */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const session = await authService.login({ email, password });

    res.status(HttpStatus.OK).json({
      success: true,
      message: AuthMessages.LOGIN_SUCCESS,
      data: session,
    });
  }

  /** POST /auth/logout */
  async logout(req: Request, res: Response): Promise<void> {
    await authService.logout(req.token);

    res.status(HttpStatus.OK).json({
      success: true,
      message: AuthMessages.LOGOUT_SUCCESS,
    });
  }

  /** POST /auth/forgot-password */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    await authService.forgotPassword(email);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Password reset email sent if account exists.',
    });
  }

  /** POST /auth/reset-password */
  async resetPassword(req: Request, res: Response): Promise<void> {
    const { password } = req.body;
    const authHeader = req.headers.authorization;
    const token = req.body.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined);

    if (!token) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: AuthMessages.TOKEN_INVALID,
        code: 'TOKEN_INVALID',
      });
      return;
    }

    await authService.resetPassword(token, password);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Password updated successfully.',
    });
  }

  /** GET /auth/me */
  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: AuthMessages.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const user = await authService.getCurrentUser(req.user.id);

    res.status(HttpStatus.OK).json({
      success: true,
      data: { user },
    });
  }

  /** PUT /auth/profile */
  async updateProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: AuthMessages.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const updatedUser = await authService.updateProfile(req.user.id, req.body);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser },
    });
  }

  /** GET /auth/google */
  async googleRedirect(_req: Request, res: Response): Promise<void> {
    const redirectUrl = `${env.SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
      `${env.CORS_ORIGIN}/login`,
    )}`;

    res.status(HttpStatus.OK).json({
      success: true,
      data: { url: redirectUrl },
    });
  }
}

export const authController = new AuthController();
