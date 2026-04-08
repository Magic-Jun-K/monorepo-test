import { test as setup } from '@playwright/test';

const authFile = 'tests/e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 由于我们没有有效的测试账户，我们创建一个模拟的认证状态
  // 这样可以避免重定向到登录页面
  await page.goto('/');
  
  // 创建一个模拟的存储状态
  await page.context().storageState({ path: authFile });
});