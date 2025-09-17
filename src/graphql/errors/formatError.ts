import { GraphQLError, GraphQLFormattedError } from 'graphql';

export default function formatGraphQLError(error: GraphQLError): GraphQLFormattedError {
  // Registrar el error en el servidor
  console.error('GraphQL Error:', error);

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
