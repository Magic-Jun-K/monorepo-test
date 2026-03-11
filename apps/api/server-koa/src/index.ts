import 'dotenv/config';

import { app } from './app';

/**
 * 启动服务器
 */
const start = async () => {
  try {
    await app.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * 优雅关闭服务器
 */
const shutdown = async () => {
  // console.log('Shutting down gracefully...');
  await app.stop();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
