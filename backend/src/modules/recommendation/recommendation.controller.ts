import type { Request, Response } from 'express';
import { recommendationOrchestrator } from './recommendation.orchestrator.js';
import { HttpStatus } from '../../constants/http-status.js';
import { prisma } from '../../database/prisma.js';

export class RecommendationController {
  async prepare(req: Request, res: Response): Promise<void> {
    const prompt = (req.body['prompt'] as string) || '';
    if (!prompt) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Prompt string is required.',
      });
      return;
    }

    const options = {
      mode: req.body['mode'] as string | undefined,
      previousPrompt: req.body['previousPrompt'] as string | undefined,
      dislikedMovieIds: req.body['dislikedMovieIds'] as number[] | undefined,
      watchedMovieIds: req.body['watchedMovieIds'] as number[] | undefined,
      languages: req.body['languages'] as string[] | undefined,
      userPreferences: req.body['userPreferences'] as {
        preferredLanguage?: string;
        maxRuntime?: number;
        minRating?: number;
        hideWatched?: boolean;
        preferredRegion?: string;
      } | undefined,
    };

    const userId = req.user?.id;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const result = await recommendationOrchestrator.prepareData(prompt, userId, options, clientIp);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const history = await prisma.recommendationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: history,
    });
  }
}

export const recommendationController = new RecommendationController();
