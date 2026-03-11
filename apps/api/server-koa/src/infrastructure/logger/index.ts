import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { config, isProduction } from '../../core/config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  }),
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  }),
);

const transports: winston.transport[] = [
  new DailyRotateFile({
    filename: `${config.LOG_DIR}/error-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
  }),
  new DailyRotateFile({
    filename: `${config.LOG_DIR}/combined-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
    zippedArchive: true,
  }),
];

if (!isProduction) {
  transports.push(new winston.transports.Console({ format: consoleFormat }));
}

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  transports,
  exitOnError: false,
});

/**
 * 创建模块级别的日志记录器
 * @param module 模块名称
 * @returns 模块级别的日志记录器
 */
export const createLogger = (module: string) => {
  return {
    debug: (message: string, meta?: Record<string, unknown>) =>
      logger.debug(`[${module}] ${message}`, meta),
    info: (message: string, meta?: Record<string, unknown>) =>
      logger.info(`[${module}] ${message}`, meta),
    warn: (message: string, meta?: Record<string, unknown>) =>
      logger.warn(`[${module}] ${message}`, meta),
    error: (message: string, meta?: Record<string, unknown>) =>
      logger.error(`[${module}] ${message}`, meta),
  };
};
