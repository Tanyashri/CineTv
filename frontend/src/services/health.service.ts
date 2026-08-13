import { apiClient } from './api.service';
import type { HealthResponse } from '@/types';

/**
 * Fetch health check data from the backend.
 */
export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
}

/**
 * Update and validate API keys in the backend.
 */
export async function updateApiKeys(keys: { tmdbApiKey?: string; geminiApiKey?: string }): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post<{ success: boolean; message: string }>('/health/keys', keys);
  return data;
}
