import { zodEnvSchema } from './schema';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '7000', 10),

  POSTGRES_URI: process.env.POSTGRES_URI || 'postgresql://postgres:postgres@localhost:5432/app',
  POSTGRES_MAX: parseInt(process.env.POSTGRES_MAX || '20', 10),
  POSTGRES_IDLE_TIMEOUT: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000', 10),
  POSTGRES_CONNECTION_TIMEOUT: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '2000', 10),

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),

  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_DIR: process.env.LOG_DIR || 'logs',

  UPLOAD_DIR: process.env.UPLOAD_DIR || 'public/uploads',
  UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10),
  UPLOAD_ALLOWED_TYPES: (
    process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,image/webp'
  ).split(','),

  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};

const parsed = zodEnvSchema.safeParse(env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;

export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test';
