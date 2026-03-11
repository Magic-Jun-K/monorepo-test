import type { DefaultState, DefaultContext } from 'koa';
import type { Pool } from 'pg';
import type { RedisClientType } from 'redis';

export interface AppState extends DefaultState {
  userId?: string;
  userEmail?: string;
}

export interface AppContext extends DefaultContext {
  state: AppState;
  db: Pool;
  redis: RedisClientType;
  validate: <T>(schema: import('zod').ZodSchema<T>, data: unknown) => T;
  success: <T>(data: T, meta?: import('./response').ResponseMeta) => void;
  fail: (error: import('./response').ApiError) => void;
}
