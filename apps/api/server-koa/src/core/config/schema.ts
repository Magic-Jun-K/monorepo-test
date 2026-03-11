import { z } from 'zod';

export const zodEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.number().default(7000),

  POSTGRES_URI: z.string().url(),
  POSTGRES_MAX: z.number().default(20),
  POSTGRES_IDLE_TIMEOUT: z.number().default(30000),
  POSTGRES_CONNECTION_TIMEOUT: z.number().default(2000),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.number().default(0),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.boolean().default(true),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_DIR: z.string().default('logs'),

  UPLOAD_DIR: z.string().default('public/uploads'),
  UPLOAD_MAX_SIZE: z.number().default(10485760),
  UPLOAD_ALLOWED_TYPES: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),

  RATE_LIMIT_WINDOW: z.number().default(900000),
  RATE_LIMIT_MAX: z.number().default(100),
});

export type EnvConfig = z.infer<typeof zodEnvSchema>;
