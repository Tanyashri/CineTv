import type { Request, Response } from 'express';
import { geminiService } from './gemini.service.js';
import { HttpStatus } from '../../constants/http-status.js';

export class GeminiController {
  async execute(req: Request, res: Response): Promise<void> {
    const prompt = (req.body['prompt'] as string) || '';
    if (!prompt) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Prompt string is required.',
      });
      return;
    }

    const result = await geminiService.executePrompt(prompt);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }

  async health(_req: Request, res: Response): Promise<void> {
    const isHealthy = await geminiService.isHealthy();
    res.status(HttpStatus.OK).json({
      success: true,
      data: { healthy: isHealthy },
    });
  }
}

export const geminiController = new GeminiController();
