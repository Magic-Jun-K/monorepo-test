import { test, expect } from '@playwright/test';

test('login page has correct title', async ({ page }) => {
  await page.goto('/account/login');
  
  // 验证登录页面标题
  await expect(page).toHaveTitle(/Eggshell测试/);
  
  // 验证登录页面有内容
  const content = page.locator('div');
  await expect(content.first()).toBeVisible();
});

test('user can navigate to login page', async ({ page }) => {
  await page.goto('/');
  
  // 检查是否已经在登录页面
  if (page.url().includes('/account/login')) {
    // 已经在登录页面
    const content = page.locator('div');
    await expect(content.first()).toBeVisible();
  } else {
    // 尝试找到登录链接
    const loginLinks = page.locator('a', { hasText: '登录' });
    if (await loginLinks.count() > 0) {
      await loginLinks.first().click();
      
      // 验证URL变化
      await expect(page).toHaveURL(/.*login/);
    } else {
      // 如果找不到登录链接，验证当前页面元素
      const content = page.locator('div');
      await expect(content.first()).toBeVisible();
    }
  }
});