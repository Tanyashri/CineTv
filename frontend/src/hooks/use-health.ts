import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/services/health.service';
import type { HealthResponse } from '@/types';

/**
 * TanStack Query hook for health check data.
 * Auto-refetches every 30 seconds.
 */
export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 30_000,
  });
}
