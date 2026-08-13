import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, '..', '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const isDev = process.env['NODE_ENV'] !== 'production';
const isTest = process.env['NODE_ENV'] === 'test';

const devTransport: pino.TransportSingleOptions = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'HH:MM:ss Z',
    ignore: 'pid,hostname',
  },
};

const prodTransports: pino.TransportMultiOptions = {
  targets: [
    {
      target: 'pino/file',
      options: { destination: path.join(logsDir, 'app.log'), mkdir: true },
      level: 'info',
    },
    {
      target: 'pino/file',
      options: { destination: path.join(logsDir, 'error.log'), mkdir: true },
      level: 'error',
    },
    {
      target: 'pino/file',
      options: { destination: 1 }, // stdout
      level: 'info',
    },
  ],
};

export const logger = pino({
  level: isTest ? 'silent' : process.env['LOG_LEVEL'] ?? (isDev ? 'debug' : 'info'),
  ...(isDev
    ? { transport: devTransport }
    : { transport: prodTransports }),
});
