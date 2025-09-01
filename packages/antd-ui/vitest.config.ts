/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import type { ViteUserConfig } from 'vitest/config';

export default defineConfig({
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
    exclude: ['node_modules', 'dist', 'es', 'lib', 'coverage'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.stories.*', 'src/**/index.ts'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // 测试超时
    testTimeout: 10000,
    hookTimeout: 10000,
    // 执行配置
    pool: 'threads',
    maxConcurrency: 2,
    silent: false,
    reporters: ['verbose']
  },
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types')
    }
  }
} as ViteUserConfig);