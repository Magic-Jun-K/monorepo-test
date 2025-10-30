# Playwright 端到端测试

本目录包含使用 Playwright 进行端到端测试的测试文件。

## 测试结构

- [app.spec.ts](file:///d:/Files/VSCode/BaiduMap/canvaskit-test/apps/frontend/react-webpack/tests/e2e/app.spec.ts) - 应用基本功能测试
- [login.spec.ts](file:///d:/Files/VSCode/BaiduMap/canvaskit-test/apps/frontend/react-webpack/tests/e2e/login.spec.ts) - 登录页面测试
- [map.spec.ts](file:///d:/Files/VSCode/BaiduMap/canvaskit-test/apps/frontend/react-webpack/tests/e2e/map.spec.ts) - 地图功能测试
- [homepage.spec.ts](file:///d:/Files/VSCode/BaiduMap/canvaskit-test/apps/frontend/react-webpack/tests/e2e/homepage.spec.ts) - 主页测试

## 运行测试

### 运行所有测试

```bash
pnpm test:e2e
```

### 运行测试并查看UI界面

```bash
pnpm test:e2e:ui
```

### 查看测试报告

```bash
pnpm test:e2e:report
```

## 编写测试

1. 在 `tests/e2e/` 目录下创建新的测试文件，文件名以 `.spec.ts` 结尾
2. 使用 Playwright 的 API 编写测试用例
3. 运行测试确保通过

## 测试配置

Playwright 的配置文件位于当前应用目录的 [playwright.config.ts](file:///d:/Files/VSCode/BaiduMap/canvaskit-test/apps/frontend/react-webpack/playwright.config.ts) 文件中。

主要配置包括：

- 测试超时时间
- 浏览器配置
- 本地开发服务器配置
- 截图和视频录制设置
- 测试报告生成

## 常见问题

### 测试失败怎么办？

1. 查看测试报告，定位失败原因
2. 检查测试代码是否正确
3. 检查应用功能是否正常
4. 必要时更新测试用例

### 如何调试测试？

1. 使用 `pnpm test:e2e:ui` 命令在UI模式下运行测试
2. 在测试代码中添加 `await page.pause()` 来暂停执行并调试
3. 查看生成的截图和视频来分析问题