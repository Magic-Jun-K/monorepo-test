import { pathsToModuleNameMapper } from 'ts-jest';

import { getBaseJestConfig } from '../../../jest.config.mjs';
import tsconfig from './tsconfig.json' with { type: 'json' };

const { compilerOptions } = tsconfig;

/** @type {import('jest').Config} */
export default getBaseJestConfig({
  displayName: 'eggshell-nest',
  rootDir: '.',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  // 测试文件匹配
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],
  // 测试环境设置
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts'],
  // 模块名映射（支持路径别名）
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, {
      prefix: '<rootDir>/',
    }),
    '^(..?/.*).js$': '$1',
  },
  // 转换忽略模式 - 允许转换 ESM 模块
  transformIgnorePatterns: ['node_modules/(?!(@eggshell/shared-crypto)/)'],
  // 转换配置
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        useESM: true,
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
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
});
