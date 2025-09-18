import { GraphQLError } from 'graphql/index.js';

export type ErrorDetails = Record<string, unknown> | undefined;

export class InvalidArgumentError extends GraphQLError {
  constructor(
    message = 'Parámetros inválidos',
    opts?: { requestId?: string; details?: ErrorDetails },
  ) {
    super(message, {
      extensions: {
        code: 'INVALID_ARGUMENT',
        requestId: opts?.requestId,
        details: opts?.details,
      },
    });
  }
}

export class NotFoundError extends GraphQLError {
  constructor(
    message = 'Recurso no encontrado',
    opts?: { requestId?: string; details?: ErrorDetails },
  ) {
    super(message, {
      extensions: {
        code: 'NOT_FOUND',
        requestId: opts?.requestId,
        details: opts?.details,
      },
    });
  }
}

export class UnauthorizedError extends GraphQLError {
  constructor(message = 'No autorizado', opts?: { requestId?: string; details?: ErrorDetails }) {
    super(message, {
      extensions: {
        code: 'UNAUTHORIZED',
        requestId: opts?.requestId,
        details: opts?.details,
      },
    });
  }
}

export class InternalError extends GraphQLError {
  constructor(message = 'Error interno', opts?: { requestId?: string; details?: ErrorDetails }) {
    super(message, {
      extensions: {
        code: 'INTERNAL_ERROR',
        requestId: opts?.requestId,
        details: opts?.details,
      },
    });
  }
}
