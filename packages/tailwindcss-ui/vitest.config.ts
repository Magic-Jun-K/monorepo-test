/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import type { ViteUserConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'jsdom',
    // 全局测试设置
    globals: true,
    // 设置文件
    setupFiles: ['./vitest.setup.ts'],
    // 测试文件匹配模式
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}', 'src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    // 排除文件
    exclude: ['node_modules', 'dist', 'build', 'coverage'],
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
      'react': resolve(__dirname, './node_modules/react'),
      'react-dom': resolve(__dirname, './node_modules/react-dom'),
      'react/jsx-runtime': resolve(__dirname, './node_modules/react/jsx-runtime')
    }
  }
} as ViteUserConfig);