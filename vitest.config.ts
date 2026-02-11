/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import type { ViteUserConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Vitest 配置 - 专用于所有前端项目的测试
 * 用于统一管理前端测试，替代 Jest 在前端项目中的使用
 */
export default defineConfig({
  test: {
    // 测试环境 - 前端组件测试
    environment: 'jsdom',
    // 全局测试设置
    globals: true,
    // 设置文件
    setupFiles: ['./vitest.setup.ts'],
    // 测试文件匹配模式 - 覆盖所有前端项目和UI包
    include: [
      // 前端应用
      'apps/frontend/**/*.{test,spec}.{js,ts,jsx,tsx}',
      // UI组件包
      'packages/ui/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/antd-ui/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/unocss-ui/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/unocss-ui-ie/**/*.{test,spec}.{js,ts,jsx,tsx}',
      // 核心业务组件
      'packages/core-business-components/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '**/*.e2e-spec.*',
      // 排除后端项目
      'apps/backend/**/*',
      // 排除node_modules中的所有测试文件
      '**/node_modules/**',
    ],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage/vitest-frontend',
      include: [
        'apps/frontend/**/*.{js,ts,jsx,tsx}',
        'packages/ui/**/*.{js,ts,jsx,tsx}',
        'packages/antd-ui/**/*.{js,ts,jsx,tsx}',
        'packages/unocss-ui/**/*.{js,ts,jsx,tsx}',
        'packages/unocss-ui-ie/**/*.{js,ts,jsx,tsx}',
        'packages/core-business-components/**/*.{js,ts,jsx,tsx}',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.setup.*',
        '**/index.ts',
        '**/*.stories.*',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
        // UI包要求更高覆盖率
        'packages/**/src/**/*.{js,jsx,ts,tsx}': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
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
  // 监听模式配置 - 排除文件
  watchExclude: ['node_modules', 'dist', 'build', 'coverage'],
  // 路径解析 - 统一前端项目路径
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@eggshell': resolve(__dirname, './packages'),
      '@frontend': resolve(__dirname, './apps/frontend'),
      '@web': resolve(__dirname, './apps/web'),
    },
  },
} as ViteUserConfig);
