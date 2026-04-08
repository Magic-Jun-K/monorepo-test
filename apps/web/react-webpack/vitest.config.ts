/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// 模拟 CommonJS 的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    // 测试环境
    environment: 'jsdom',
    // 全局测试设置
    globals: true,
    // 设置文件
    setupFiles: ['./vitest.setup.ts'],
    // 测试文件匹配模式
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    // 排除文件
    exclude: ['node_modules', 'dist', 'coverage'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.stories.*', 'src/**/index.ts'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    // 测试超时
    testTimeout: 10000,
    hookTimeout: 10000,
    // 执行配置
    pool: 'threads',
    maxConcurrency: 2,
    silent: false,
    reporters: ['verbose'],
  },
  // 路径解析 - 与 webpack 配置保持一致
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/services': resolve(__dirname, './src/services'),
      '@/store': resolve(__dirname, './src/store'),
      '@eggshell': resolve(__dirname, '../../../packages'),
      '@frontend': resolve(__dirname, '../'),
    },
  },
});
