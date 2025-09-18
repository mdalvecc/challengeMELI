import { pino, type Logger, type LoggerOptions } from 'pino';

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

export type AppLogger = Logger;

// En desarrollo intentamos usar pino-pretty como stream; en producción, salida JSON a stdout.
// Nota: hacemos import dinámico para no requerir la dependencia en producción.
async function createLogger(): Promise<AppLogger> {
  if (isDev) {
    try {
      const mod = await import('pino-pretty');
      const prettyStream = mod.default({
        colorize: true,
        translateTime: 'SYS:standard',
        singleLine: false,
        ignore: 'pid,hostname',
      });
      return pino(baseOptions, prettyStream);
    } catch {
      // Si no está instalado pino-pretty (p. ej., en entornos sin devDeps), seguimos con JSON
      return pino(baseOptions);
    }
  }
  return pino(baseOptions);
}

export const logger = await createLogger();

// Helper para obtener el logger del contexto (si existe) o el base
export function getLogger(context?: { logger?: AppLogger } | null): AppLogger {
  return context?.logger ?? logger;
}
