// Jest 类型声明
/// <reference types="jest" />
import 'reflect-metadata';

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_DATABASE = 'test_db';

// 设置测试超时
jest.setTimeout(30000);

// 全局清理
afterEach(() => {
  jest.clearAllMocks();
});

// 模拟常用的外部依赖
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    createConnection: jest.fn(),
    getConnection: jest.fn(() => ({
      close: jest.fn(),
      isConnected: true,
    })),
  };
});

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    disconnect: jest.fn(),
  }));
});
