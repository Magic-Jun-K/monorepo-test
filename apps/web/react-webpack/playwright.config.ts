import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试文件目录
  testDir: './tests/e2e',
  // 测试文件匹配模式
  testMatch: '*.spec.ts',
  // 超时时间
  timeout: 30 * 1000,
  // 期望超时时间
  expect: {
    timeout: 5000
  },
  // 是否完全并行执行测试
  fullyParallel: true,
  // 是否在失败时停止
  forbidOnly: !!process.env.CI,
  // 重试次数
  retries: process.env.CI ? 2 : 0,
  // 工作进程数
  workers: process.env.CI ? 1 : '50%',
  // Reporter to use
  reporter: 'html',
  // 共享设置
  use: {
    // 基础URL
    // 这里的端口号要跟webpack.config.dev.mjs内的端口号一致
    baseURL: 'http://localhost:3000',
    
    // 收集trace用于调试
    trace: 'on-first-retry',
    
    // 截图设置
    screenshot: 'only-on-failure',
    
    // 视频设置
    video: 'retain-on-failure',
  },
  // 项目配置
  projects: [
    // 设置项目
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 使用认证状态
        storageState: 'tests/e2e/.auth/user.json'
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // 使用认证状态
        storageState: 'tests/e2e/.auth/user.json'
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // 使用认证状态
        storageState: 'tests/e2e/.auth/user.json'
      },
      dependencies: ['setup'],
    },
    // 移动浏览器支持
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // 使用认证状态
        storageState: 'tests/e2e/.auth/user.json'
      },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        // 使用认证状态
        storageState: 'tests/e2e/.auth/user.json'
      },
      dependencies: ['setup'],
    },
  ],
  // 本地开发服务器配置
  webServer: {
    command: 'pnpm dev',
    // 这里的端口号要跟webpack.config.dev.mjs内的端口号一致
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});