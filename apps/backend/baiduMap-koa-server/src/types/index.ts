import Koa from 'koa';
import { Pool } from 'pg';
import { RedisClientType } from 'redis';

// Database types
export type DatabasePool = Pool;
export interface DatabaseConnection {
  query: Pool['query'];
  release: () => void;
}

// Redis types
export type RedisClient = RedisClientType;

// Application state types
export interface AppState {
  db: DatabasePool;
  redis: RedisClient;
  user?: {
    id: string;
    roles: string[];
  };
}

// Error types
export interface AppError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
  isOperational?: boolean;
  stack?: string;
}

export interface ValidationError extends AppError {
  fields: Record<string, string>;
}

// Request context type
export interface AppContext extends Koa.Context {
  state: AppState;
}

// Configuration types
export interface ServerConfig {
  port: number;
  env: 'development' | 'production' | 'test';
  corsOrigin: string;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  ttl: number;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  auth: AuthConfig;
}
