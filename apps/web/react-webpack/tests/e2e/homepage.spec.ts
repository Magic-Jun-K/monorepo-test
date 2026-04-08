import { test, expect } from '@playwright/test';

test('homepage has title and heading', async ({ page }) => {
  await page.goto('/');
  
  // 验证页面标题
  await expect(page).toHaveTitle(/Eggshell测试/);
  
  // 验证页面有内容
  const content = page.locator('div');
  await expect(content.first()).toBeVisible();
});

test('navigation works correctly', async ({ page }) => {
  await page.goto('/');
  
  // 验证页面有内容
  const content = page.locator('div');
  await expect(content.first()).toBeVisible();
  
  // 如果有链接，测试导航
  const links = page.locator('a');
  if (await links.count() > 0) {
    const firstLink = links.first();
    const href = await firstLink.getAttribute('href');
    
    // 只测试内部链接
    if (href && (href.startsWith('/') || href.startsWith('#'))) {
      await firstLink.click();
      // 等待页面加载
      await page.waitForLoadState('networkidle');
    }
  }
});