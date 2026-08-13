import type { Request, Response } from 'express';
import { wikipediaService } from './wikipedia.service.js';
import { HttpStatus } from '../../constants/http-status.js';

export class WikipediaController {
  async enrich(req: Request, res: Response): Promise<void> {
    const title = (req.query['title'] as string) || (req.params['title'] as string) || '';
    if (!title) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Title parameter is required.',
      });
      return;
    }

    const data = await wikipediaService.enrichMovie(title);
    if (!data) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Wikipedia article not found for the given title.',
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data,
    });
  }
}

export const wikipediaController = new WikipediaController();
