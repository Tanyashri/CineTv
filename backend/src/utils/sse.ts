import type { Request, Response } from 'express';
import { logger } from './logger.js';

export interface SSEClient {
  id: string;
  res: Response;
}

const clients = new Map<string, SSEClient>();

/**
 * Initialize an SSE connection on the response.
 * Sets correct headers, handles client disconnect cleanup.
 */
export function initSSE(req: Request, res: Response, clientId: string): SSEClient {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);

  const client: SSEClient = { id: clientId, res };
  clients.set(clientId, client);

  logger.debug({ clientId }, 'SSE client connected');

  // Cleanup on disconnect
  req.on('close', () => {
    clients.delete(clientId);
    logger.debug({ clientId }, 'SSE client disconnected');
  });

  return client;
}

/**
 * Send an event to a specific SSE client.
 */
export function sendSSEEvent(clientId: string, event: string, data: unknown): boolean {
  const client = clients.get(clientId);
  if (!client) return false;

  client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  return true;
}

/**
 * Broadcast an event to all connected SSE clients.
 */
export function broadcastSSE(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients.values()) {
    client.res.write(payload);
  }
}

/**
 * Get the count of currently connected SSE clients.
 */
export function getSSEClientCount(): number {
  return clients.size;
}
