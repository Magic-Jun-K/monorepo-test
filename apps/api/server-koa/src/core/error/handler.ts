import type { AppContext } from '../../shared/types';
import { createLogger } from '../../infrastructure/logger';

const logger = createLogger('error-handler');

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: Record<string, unknown>) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
    this.name = 'TooManyRequestsError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
    this.name = 'InternalServerError';
  }
}

export function errorHandler() {
  return async (ctx: AppContext, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      if (error instanceof AppError) {
        ctx.status = error.statusCode;
        ctx.body = {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
        if (!error.isOperational) {
          logger.error('Operational error', { error: error.message, code: error.code });
        }
      } else if (error instanceof Error) {
        logger.error('Unhandled error', { error: error.message, stack: error.stack });
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: isProduction ? 'Internal server error' : error.message,
          },
        };
      } else {
        logger.error('Unknown error', { error: String(error) });
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        };
      }
    }
  };
}

const isProduction = process.env.NODE_ENV === 'production';
