import 'dotenv/config';

import { logger } from '@app/lib/logger.js';
import { createServer } from './server.js';
import { initializeServices } from './services/init.js';
import { logBootMessages } from './utils/bootMessages.js';

// Iniciar la aplicación
try {
  // Inicializar servicios antes de crear el servidor
  await initializeServices();

  const server = await createServer();

  // Iniciar el servidor
  const PORT = process.env.PORT || 4000;
  const { url } = await server.listen({ port: PORT });

  logBootMessages(url);
  logger.info('Servidor iniciado correctamente');
} catch (error) {
  logger.error({ err: error }, 'Error al iniciar el servidor en el startServer');
  process.exit(1);
}

// Manejar cierre limpio del servidor
process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Apagando el servidor...');
  process.exit(0);
});

process.on('unhandledRejection', reason => {
  logger.error({ err: reason }, 'Unhandled Rejection');
  // process.exit(1);
});

process.on('uncaughtException', err => {
  logger.error({ err }, 'Uncaught Exception');
  // process.exit(1);
});
