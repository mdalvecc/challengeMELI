import { pino, type LoggerOptions } from 'pino';
import pinoPretty from 'pino-pretty';

const isDev = process.env.NODE_ENV !== 'production';

const baseOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  base: {
    service: process.env.SERVICE_NAME || 'challenge-meli-api',
    env: process.env.NODE_ENV || 'development',
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'request.headers.authorization',
      'headers.authorization',
      'req.headers.cookie',
      'request.headers.cookie',
      'headers.cookie',
    ],
    remove: true,
  },
};

// En desarrollo usamos pino-pretty como stream; en producción, salida JSON a stdout
const prettyStream = isDev
  ? pinoPretty({
      colorize: true,
      translateTime: 'SYS:standard',
      singleLine: false,
      ignore: 'pid,hostname',
    })
  : undefined;

export const logger = prettyStream ? pino(baseOptions, prettyStream) : pino(baseOptions);

export type AppLogger = typeof logger;

// Helper para obtener el logger del contexto (si existe) o el base
export function getLogger(context?: { logger?: AppLogger } | null): AppLogger {
  return context && context.logger ? context.logger : logger;
}
