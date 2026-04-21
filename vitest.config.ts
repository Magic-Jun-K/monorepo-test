/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import type { ViteUserConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Monorepo 共享 Vitest 基础配置
 * 前端项目应继承并覆盖 jsdom 环境
 * 后端项目应继承并覆盖 node 环境
 */
export default defineConfig({
  test: {
    // 基础环境 - 被子配置覆盖
    environment: 'node',
    // 全局测试设置
    globals: true,
    // 设置文件
    setupFiles: ['./vitest.setup.ts'],
    // 测试文件匹配模式 - 覆盖所有项目
    include: [
      // 前端应用
      'apps/frontend/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'apps/web/**/*.{test,spec}.{js,ts,jsx,tsx}',
      // 后端应用
      'apps/api/**/*.{test,spec}.ts',
      'apps/backend/**/*.{test,spec}.ts',
      // Packages
      'packages/ui/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/antd-ui/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/unocss-ui/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/unocss-ui-ie/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/core-business-components/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/hooks/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/shared/**/*.{test,spec}.ts',
    ],
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '**/*.e2e-spec.*',
      '**/*.e2e.{test,spec}.{js,ts,jsx,tsx}',
    ],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      include: ['apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts', 'packages/**/*.tsx'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.setup.*',
        '**/index.ts',
        '**/*.stories.*',
        '**/*.module.ts',
        '**/*.dto.ts',
        '**/*.entity.ts',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    // 超时配置
    testTimeout: 15000,
    hookTimeout: 10000,
    // 执行配置
    pool: 'threads',
    maxConcurrency: 4,
    silent: false,
    reporters: ['verbose'],
  },
  // 监听模式排除
  watchExclude: ['node_modules', 'dist', 'build', 'coverage'],
  // 路径解析 - 根级别
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@eggshell': resolve(__dirname, './packages'),
      '@frontend': resolve(__dirname, './apps/frontend'),
      '@web': resolve(__dirname, './apps/web'),
      '@api': resolve(__dirname, './apps/api'),
      '@backend': resolve(__dirname, './apps/backend'),
    },
  },
} as ViteUserConfig);
