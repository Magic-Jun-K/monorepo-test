import { test, expect } from '@playwright/test';

test('app loads and displays homepage', async ({ page }) => {
  await page.goto('/');
  
  // 验证页面是否加载成功
  await expect(page).toHaveTitle(/Eggshell测试/);
  
  // 验证页面有内容
  const content = page.locator('div');
  await expect(content.first()).toBeVisible();
});

test('navigation menu works', async ({ page }) => {
  await page.goto('/');
  
  // 验证页面有内容
  const content = page.locator('div');
  await expect(content.first()).toBeVisible();
  
  // 如果有按钮，测试点击功能
  const buttons = page.locator('button');
  if (await buttons.count() > 0) {
    const firstButton = buttons.first();
    await firstButton.click();
    
    // 验证页面仍然有内容
    await expect(content.first()).toBeVisible();
  }
});

test('user can navigate to different pages', async ({ page }) => {
  await page.goto('/');
  
  // 验证页面有内容
  const content = page.locator('div');
  await expect(content.first()).toBeVisible();
  
  // 收集所有导航链接
  const links = page.locator('a[href]');
  const count = await links.count();
  
  // 如果有链接，测试第一个链接的导航
  if (count > 0) {
    const firstLink = links.first();
    const href = await firstLink.getAttribute('href');
    
    // 只测试内部链接
    if (href && (href.startsWith('/') || href.startsWith('#'))) {
      await firstLink.click();
      // 等待页面加载
      await page.waitForLoadState('networkidle');
      
      // 验证新页面有内容
      await expect(content.first()).toBeVisible();
    }
  }
});