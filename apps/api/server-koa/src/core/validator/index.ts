import { ZodError, type ZodSchema } from 'zod';

import { ValidationError } from '../error/handler';
import { createLogger } from '../../infrastructure/logger';
import type { AppContext } from '../../shared/types';

const logger = createLogger('validator');

type ValidateFn = <T>(schema: ZodSchema<T>, data: unknown) => T;

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      logger.warn('Validation failed', { details });
      throw new ValidationError('Validation failed', { details });
    }
    throw error;
  }
}

export function validatorMiddleware() {
  return async (ctx: AppContext, next: () => Promise<void>) => {
    (ctx as AppContext & { validate: ValidateFn }).validate = validate;
    await next();
  };
}

export { z } from 'zod';
export type { ZodSchema, ZodError } from 'zod';
