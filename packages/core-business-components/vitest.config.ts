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
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    // 排除文件
    exclude: ['node_modules', 'dist', 'build', 'coverage'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.d.ts', 
        'src/**/*.stories.*', 
        'src/**/index.ts', 
        'src/main.tsx', 
        'src/App.tsx',
        'src/components/**/worker/*'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    // 测试超时
    testTimeout: 15000,
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
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@eggshell/ui-unocss': resolve(__dirname, '../unocss-ui/src')
    }
  },
  // 添加对虚拟模块的处理
  define: {
    // 为测试环境定义虚拟模块的模拟
    'import.meta.vitest': 'undefined'
  },
  // 添加对虚拟CSS模块的处理
  plugins: [
    {
      name: 'mock-virtual-modules',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'virtual:uno.css') {
          return id;
        }
        return null;
      },
      load(id) {
        if (id === 'virtual:uno.css') {
          return '';
        }
        return null;
      }
    }
  ]
} as ViteUserConfig);