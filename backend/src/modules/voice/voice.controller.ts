import type { Request, Response } from 'express';
import { voiceService } from './voice.service.js';
import { HttpStatus } from '../../constants/http-status.js';

export class VoiceController {
  async process(req: Request, res: Response): Promise<void> {
    const transcript = (req.body['transcript'] as string) || '';
    const language = (req.body['language'] as string) || 'en-US';
    const confidence = Number(req.body['confidence']) || 1.0;

    if (!transcript) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Transcript string is required.',
      });
      return;
    }

    const result = voiceService.processTranscript(transcript, language, confidence);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }

  async supportConfig(_req: Request, res: Response): Promise<void> {
    const config = voiceService.getBrowserSupportConfig();
    res.status(HttpStatus.OK).json({
      success: true,
      data: config,
    });
  }
}

export const voiceController = new VoiceController();
