import { logger } from '@app/lib/logger.js';
import { GraphQLError, GraphQLFormattedError } from 'graphql/index.js';

export default function formatGraphQLError(error: GraphQLError): GraphQLFormattedError {
  // Registrar el error en el servidor (con requestId si está disponible)
  logger.error({ err: error, requestId: error.extensions?.requestId }, 'GraphQL Error');

  // No exponer detalles internos en producción
  const isProduction = process.env.NODE_ENV === 'production';
  const message =
    isProduction && error.extensions?.code === 'INTERNAL_SERVER_ERROR'
      ? 'Ocurrió un error interno en el servidor'
      : error.message;

  const formattedError: GraphQLFormattedError = {
    message,
    ...(error.locations && { locations: error.locations }),
    ...(error.path && { path: error.path }),
    extensions: {
      ...error.extensions,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    },
  };

  return formattedError;
}
