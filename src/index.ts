import 'dotenv/config';

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
  console.log('Servidor iniciado correctamente');
} catch (error) {
  console.error('Error al iniciar el servidor en el startServer');
  console.error(error);
  process.exit(1);
}

// Manejar cierre limpio del servidor
process.on('SIGINT', () => {
  console.log('\nApagando el servidor...');
  process.exit(0);
});

process.on('unhandledRejection', reason => {
  console.error('Unhandled Rejection:', reason);
  //process.exit(1);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  //process.exit(1);
});
