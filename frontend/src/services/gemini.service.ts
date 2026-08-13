import { apiClient } from './api.service';
import type { ApiResponse } from '../types/api.types';

export interface GeminiExecuteResponse {
  text: string;
  cached: boolean;
}

export class FrontendGeminiService {
  async executePrompt(prompt: string): Promise<GeminiExecuteResponse> {
    try {
      const response = await apiClient.post<ApiResponse<GeminiExecuteResponse>>('/gemini/execute', {
        prompt,
      });
      return response.data.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gemini request failed.';
      return {
        text: `Unable to connect to AI engine (${message}).`,
        cached: false,
      };
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<{ healthy: boolean }>>('/gemini/health');
      return response.data.data.healthy;
    } catch {
      return false;
    }
  }
}

export const frontendGeminiService = new FrontendGeminiService();
