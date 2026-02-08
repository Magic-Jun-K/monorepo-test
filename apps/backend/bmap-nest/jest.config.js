import { pathsToModuleNameMapper } from 'ts-jest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import tsconfig from './tsconfig.json' with { type: 'json' };

const { compilerOptions } = tsconfig;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('jest').Config} */
export default {
  displayName: 'bmap-nest',
  preset: 'ts-jest',
  testEnvironment: 'node', // 测试环境
  rootDir: '.', // 根目录
  // 测试文件匹配
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],
  // 测试环境设置
  setupFilesAfterEnv: [join(__dirname, 'src/test/setup.ts')],
  // 模块名映射（支持路径别名）
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }),
  // 转换配置
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // 忽略模式
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'json', 'ts'],
  testTimeout: 30000, // 测试超时
  clearMocks: true, // 清理模拟
  verbose: true, // 详细输出
};
