import path from 'node:path';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 7000,
    env: process.env.NODE_ENV || 'development',
  },

  // 数据库配置
  database: {
    url: process.env.POSTGRES_URI || 'postgresql://localhost:5432/',
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
  },

  // 文件上传配置
  upload: {
    directory: path.join(import.meta.url, '../../public/uploads'),
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },

  // 跨域配置
  cors: {
    // origin: process.env.CORS_ORIGIN || '*',
    origin: 'http://localhost:3000',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  },

  // 日志配置
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    directory: path.join(import.meta.url, '../../logs'),
  },

  // 缓存配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
};
export default config;
