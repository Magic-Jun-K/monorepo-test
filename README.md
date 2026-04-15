# 🗺️ Monorepo Test - 现代前后端一体化项目

[![pnpm](https://img.shields.io/badge/pnpm-10.20.0+-orange.svg)](https://pnpm.io/)
[![Node.js](https://img.shields.io/badge/Node.js-22.16.0+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[🌐 在线演示] https://eggshell.asia**

---

## 📋 目录

- [🎯 项目概述](#-项目概述)
- [🏗️ 技术架构](#️-技术架构)
- [📦 项目结构](#-项目结构)
- [✨ 核心特性](#-核心特性)
- [🚀 快速开始](#-快速开始)
- [🔧 开发指南](#-开发指南)
- [🧪 测试体系](#-测试体系)
- [🚢 部署方案](#-部署方案)
- [📊 性能监控](#️-性能监控)
- [🔒 安全特性](#-安全特性)
- [🤝 贡献指南](#-贡献指南)

---

## 🎯 项目概述

本项目是一个基于 **pnpm monorepo** 架构的现代化前后端一体化开发框架。项目整合了多种前端技术栈和后端服务，提供完整的开发、测试、构建和部署解决方案。

### 🎯 设计目标

- **模块化架构** - 基于 pnpm workspaces 实现代码共享和依赖管理
- **多技术栈支持** - 支持 React、Next.js、NestJS 等多种技术
- **类型安全** - 全链路 TypeScript 类型支持
- **现代化开发** - 集成最新的开发工具和最佳实践
- **容器化部署** - 支持 Docker 部署

### 🏆 项目优势

| 优势            | 说明                                  |
| --------------- | ------------------------------------- |
| 💡 **代码复用** | packages 中的公共代码可被所有应用共享 |
| 🔄 **统一版本** | 所有包版本保持一致，避免依赖冲突      |
| 🚀 **增量构建** | 使用 Turbo 实现智能增量构建           |
| 📦 **独立部署** | 每个应用可独立部署，互不影响          |
| 🔍 **统一规范** | ESLint、Prettier、TypeScript 配置统一 |

---

## 🏗️ 技术架构

### 🎨 前端技术栈

| 技术             | 应用                      | 说明            |
| ---------------- | ------------------------- | --------------- |
| **React 18+**    | react-vite, react-webpack | 现代化 UI 框架  |
| **Vite 8+**      | react-vite                | 极速开发体验    |
| **Webpack 5**    | react-webpack             | 企业级构建      |
| **Next.js 15**   | bmap-next-15              | 全栈 React 框架 |
| **TypeScript 5** | 全项目                    | 类型安全        |

### 🎭 CSS 解决方案

| 技术                  | 应用        | 说明             |
| --------------------- | ----------- | ---------------- |
| **Tailwind CSS**      | ui/tailwind | 原子化 CSS 框架  |
| **UnoCSS**            | ui/unocss   | 即时按需原子 CSS |
| **Styled Components** | ui/styled   | CSS-in-JS 方案   |
| **Sass/SCSS**         | 多个应用    | 预处理器支持     |
| **Ant Design**        | ui/antd     | 企业级 UI 组件库 |

### 🏗️ 后端技术栈

| 技术           | 应用                                            | 说明                |
| -------------- | ----------------------------------------------- | ------------------- |
| **NestJS 11+** | eggshell-nest, bmap-nest-rpc, perf-monitor-nest | 企业级 Node.js 框架 |
| **TypeScript** | NestJS 应用                                     | 后端类型支持        |

#### NestJS 服务模块详解

##### eggshell-nest (主服务)

| 模块            | 功能                           |
| --------------- | ------------------------------ |
| **auth**        | JWT 认证、邮箱验证、登录限制   |
| **user**        | 用户管理、OAuth 集成、个人资料 |
| **admin**       | 审计日志、权限管理             |
| **role**        | RBAC 角色权限管理              |
| **permission**  | 细粒度权限控制                 |
| **file**        | 文件上传下载管理               |
| **image**       | 图片处理服务                   |
| **mail**        | 邮件发送服务                   |
| **redis**       | Redis 缓存 (含 LRU)            |
| **table**       | 通用表格服务                   |
| **detail**      | 详情页服务                     |
| **application** | 应用管理                       |

##### perf-monitor-nest (性能监控服务)

| 模块               | 功能                       |
| ------------------ | -------------------------- |
| **performance**    | 性能数据收集与分析         |
| **collector**      | 前端性能指标采集           |
| **alert**          | 告警调度与通知             |
| **error-log**      | 前端错误日志追踪           |
| **visualization**  | 性能数据可视化             |
| **kafka-consumer** | Kafka 消息消费             |
| **database**       | ClickHouse + Redis 集成    |
| **common**         | 过滤器、拦截器、监控中间件 |

### 🛠️ 开发工具链

| 类别           | 工具                | 说明                   |
| -------------- | ------------------- | ---------------------- |
| **包管理**     | pnpm 10.20+         | 高效的 monorepo 包管理 |
| **构建**       | Turbo               | 增量构建和缓存         |
| **代码检查**   | ESLint + Oxlint     | 代码质量检查           |
| **代码格式化** | Prettier            | 统一代码风格           |
| **Git 钩子**   | Husky + lint-staged | 提交前检查             |
| **提交规范**   | Commitizen          | 规范化提交信息         |

### 🧪 测试技术栈

| 技术                | 说明               |
| ------------------- | ------------------ |
| **Vitest**          | 前端现代化测试框架 |
| **Jest**            | 后端单元测试框架   |
| **Testing Library** | React 组件测试     |
| **Playwright**      | E2E 端到端测试     |
| **Supertest**       | HTTP API 测试      |

---

## 📦 项目结构

```
monorepo-test/
├── 📁 apps/                          # 应用程序目录
│   ├── 📁 api/                       # API 服务
│   │   ├── 📁 eggshell-nest/        # NestJS 主服务
│   │   │   ├── src/
│   │   │   │   ├── modules/          # 业务模块
│   │   │   │   │   ├── auth/         # 认证模块
│   │   │   │   │   ├── user/         # 用户模块
│   │   │   │   │   ├── file/         # 文件模块
│   │   │   │   │   ├── mail/         # 邮件模块
│   │   │   │   │   ├── redis/        # 缓存模块
│   │   │   │   │   └── admin/        # 管理模块
│   │   │   │   ├── common/           # 公共模块
│   │   │   │   ├── config/           # 配置
│   │   │   │   └── test/             # E2E 测试
│   │   │   ├── Dockerfile
│   │   │   ├── nest-cli.json
│   │   │   └── package.json
│   │   └── 📁 server-koa/             # Koa 服务
│   │       ├── src/
│   │       │   ├── core/             # 核心配置
│   │       │   ├── middleware/       # 中间件
│   │       │   ├── modules/          # 业务模块
│   │       │   └── infrastructure/   # 基础设施
│   │       └── package.json
│   ├── 📁 backend/                   # 后端服务
│   │   ├── 📁 bmap-nest-rpc/         # NestJS + RPC 服务
│   │   │   ├── src/
│   │   │   │   ├── proto/            # gRPC proto 文件
│   │   │   │   ├── module/           # 业务模块
│   │   │   │   ├── entities/         # 数据实体
│   │   │   │   └── generated/        # 生成的代码
│   │   │   ├── Dockerfile
│   │   │   └── package.json
│   │   └── 📁 perf-monitor-nest/     # 性能监控服务
│   │       └── src/
│   └── 📁 web/                       # Web 应用
│       ├── 📁 bmap-next-15/          # Next.js 15 应用
│       │   ├── app/                  # Next.js App Router
│       │   │   ├── page.tsx          # 首页
│       │   │   └── image-test/       # 图片测试页
│       │   ├── public/               # 静态资源
│       │   ├── Dockerfile
│       │   └── package.json
│       ├── 📁 react-webpack/         # React + Webpack 主应用
│       │   ├── src/
│       │   │   ├── components/       # 组件 (ECharts, LazyImage, Toast, ErrorBoundary)
│       │   │   ├── layout/           # 布局 (Header, Menu, LayoutBody)
│       │   │   ├── pages/            # 页面
│       │   │   │   ├── BMapCom/      # 百度地图组件
│       │   │   │   ├── BMapGLCom/    # 百度地图GL组件
│       │   │   │   ├── Home/         # 首页
│       │   │   │   ├── Login/        # 登录
│       │   │   │   ├── User/         # 用户管理
│       │   │   │   ├── FormTest/     # 表单测试
│       │   │   │   ├── TableTest/    # 表格测试
│       │   │   │   ├── VirtualListTest/  # 虚拟列表
│       │   │   │   ├── TailwindTest/ # Tailwind测试
│       │   │   │   └── SentryTest/    # 错误监控测试
│       │   │   ├── router/           # 路由
│       │   │   ├── services/         # API 服务
│       │   │   ├── stores/           # 状态管理 (Redux, Zustand)
│       │   │   ├── hooks/            # 自定义 Hooks
│       │   │   ├── utils/            # 工具函数
│       │   │   └── styles/           # 样式
│       │   ├── public/              # 静态资源
│       │   ├── tests/               # E2E 测试
│       │   ├── scripts/             # 构建脚本
│       │   ├── plugins/             # Webpack 插件
│       │   ├── docs/                # 文档
│       │   ├── Dockerfile
│       │   ├── webpack.config.mjs
│       │   └── package.json
│       └── 📁 react-vite/            # React + Vite 应用
│           ├── src/
│           ├── public/
│           └── package.json
├── 📁 packages/                       # 共享包目录
│   ├── 📁 ui/                        # UI 组件库
│   │   ├── 📁 antd/                  # Ant Design 组件
│   │   │   └── src/components/       # SearchCom, TableCom
│   │   ├── 📁 tailwind/              # Tailwind CSS 组件
│   │   │   └── src/components/       # Button, Dialog, Input, Swiper
│   │   ├── 📁 unocss/                # UnoCSS 组件
│   │   │   └── src/components/       # AutoComplete, Button
│   │   └── 📁 styled/                # Styled Components
│   │       └── src/components/       # Button, Input, Modal, Table
│   ├── 📁 core-business-components/  # 核心业务组件
│   │   ├── 📁 assembly/              # AssemblyScript 组件
│   │   │   ├── src/                   # 地图点处理
│   │   │   └── plugins/               # Vite 插件
│   │   └── 📁 src/components/         # 核心组件
│   │       ├── MapCom/               # 地图组件
│   │       ├── MapSearch/            # 地图搜索
│   │       └── ECharts/               # 图表组件
│   └── 📁 shared/                     # 共享工具
│       └── 📁 crypto/                 # 密码学工具
│           └── src/
│               ├── node/              # Node.js 端
│               ├── web/               # 浏览器端
│               └── shared/            # 共享代码
├── 📁 scripts/                        # 构建脚本
├── 📁 .github/                        # GitHub 配置
│   └── workflows/                     # CI/CD 工作流
├── 📄 turbo.json                      # Turbo 构建配置
├── 📄 pnpm-workspace.yaml             # pnpm 工作区配置
├── 📄 tsconfig.json                   # TypeScript 根配置
└── 📄 package.json                    # 根包配置
```

---

## ✨ 核心特性

### 🎨 多前端技术栈支持

#### React + Vite

- ⚡ **极速启动** - Vite 基于 ESM，开发服务器即时的热更新
- 🔥 **热模块替换** - 快速高效的热模块替换体验
- 📦 **智能构建** - Rollup 构建优化，Tree Shaking
- 🎯 **类型支持** - 完整的 TypeScript 类型推断

#### React + Webpack

- 🏢 **企业级构建** - 成熟的构建配置
- 🔧 **高度定制** - 灵活的 webpack 配置选项
- 📊 **详细日志** - 详细的构建产物分析
- 🌐 **多种输出** - 支持多种部署目标

#### Next.js 15

- 🚀 **全栈框架** - 服务端渲染 (SSR) 和静态站点生成 (SSG)
- �路由系统\*\* - App Router 现代化路由
- 🔄 **混合渲染** - 支持 SSR、SSG、ISR
- 📱 **图片优化** - 自动图片优化

### 🏗️ 后端服务架构

#### NestJS 企业级框架

- 📐 **模块化架构** - 清晰的模块划分
- 🔌 **依赖注入** - 强大的依赖注入系统
- 🎭 **装饰器** - 基于装饰器的路由定义
- 📚 **完整文档** - 丰富的官方文档和社区

**支持特性：**

- ✅ gRPC & RPC 调用
- ✅ WebSocket 实时通信
- ✅ JWT & Passport 认证
- ✅ TypeORM & Prisma ORM
- ✅ Redis 缓存
- ✅ 文件上传下载
- ✅ 邮件发送
- ✅ 权限管理 (RBAC)

### 🛠️ 开发工具集成

#### TypeScript 完整支持

- 🔍 **类型检查** - 编译时类型检查
- 🎯 **智能提示** - IDE 智能代码补全
- 📚 **文档生成** - 类型即文档
- 🔄 **重构支持** - 类型安全的重构

#### 代码质量工具

| 工具            | 配置             | 说明           |
| --------------- | ---------------- | -------------- |
| **ESLint**      | eslint.config.js | 代码规范检查   |
| **Oxlint**      | oxlintrc.json    | 快速的代码检查 |
| **Prettier**    | .prettierrc      | 代码格式化     |
| **Husky**       | .husky/          | Git 钩子       |
| **lint-staged** | package.json     | 暂存区检查     |

#### Git 工作流

```bash
# 提交规范 (Commitizen)
feat:     新功能
fix:      修复 bug
docs:     文档更新
style:    代码格式调整
refactor: 重构
perf:     性能优化
test:     测试
chore:    构建/工具
```

---

## 🚀 快速开始

### 📋 环境要求

| 要求        | 版本       | 说明                     |
| ----------- | ---------- | ------------------------ |
| **Node.js** | >= 22.16.0 | 推荐使用 nvm 或 fnm 管理 |
| **pnpm**    | >= 10.20.0 | monorepo 包管理器        |
| **Docker**  | >= 20.10   | 容器化部署 (可选)        |
| **Git**     | >= 2.30    | 版本控制                 |

### ⚡ 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd monorepo-test
```

#### 2. 安装 pnpm (如果未安装)

```bash
# 使用 npm 安装
npm install -g pnpm
```

#### 3. 安装依赖

```bash
# 从项目根目录安装所有依赖
pnpm install

# 如果遇到问题，尝试清理后重装
pnpm store prune
pnpm install --force
```

#### 4. 配置环境变量

```bash
# 复制环境变量模板
cp apps/backend/eggshell-nest/.env.example apps/backend/eggshell-nest/.env

# 编辑配置
vim apps/backend/eggshell-nest/.env
```

**主要配置项：**

```env
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=eggshell

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT 配置
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# 百度地图 API (可选)
BAIDU_MAP_AK=your_baidu_map_ak
```

#### 5. 启动开发服务器

```bash
# 启动所有应用
pnpm dev

# 或启动特定应用
pnpm dev:react-webpack      # 启动 React Webpack 应用
pnpm dev:eggshell-nest   # 启动 NestJS 服务
```

### ✅ 验证安装

```bash
# 代码质量检查
pnpm lint

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 构建项目
pnpm build
```

---

## 🔧 开发指南

### 📝 常用命令

#### 全局命令 (根目录)

| 命令             | 功能                 |
| ---------------- | -------------------- |
| `pnpm test`      | 运行所有测试         |
| `pnpm lint`      | 代码质量检查         |
| `pnpm typecheck` | TypeScript 类型检查  |
| `pnpm clean`     | 清理构建产物         |
| `pnpm format`    | 格式化代码           |
| `pnpm commit`    | 使用 Commitizen 提交 |

### 🎯 开发工作流

#### 1. 创建功能分支

```bash
# 基于 main 创建新分支
git checkout -b feature/your-feature-name

# 或基于 develop
git checkout -b feature/your-feature-name develop
```

#### 2. 编写代码

```bash
# 启动开发服务器
pnpm dev:react-webpack

# 开启测试监听模式
pnpm test:watch

# 开启 ESLint 检查
pnpm lint --watch
```

#### 3. 提交代码

```bash
# 使用 Commitizen 交互式提交
pnpm commit

# 或直接提交
pnpm git commit -m "feat: add new feature"

# 推送到远程
pnpm git push -u origin feature/your-feature-name
```

#### 4. 创建 Pull Request

```bash
# 更新分支
git fetch origin
git rebase origin/main

# 推送并创建 PR
git push -u origin feature/your-feature-name
```

### 📐 代码规范

#### TypeScript 规范

- ✅ 使用 strict 模式
- ✅ 避免使用 `any`，使用 `unknown` 替代
- ✅ 优先使用 `const`，避免使用 `var`
- ✅ 使用 `interface` 定义对象类型，`type` 定义联合类型
- ✅ 导出类型时使用 `export type`

#### React 组件规范

```tsx
// ✅ 推荐：使用函数组件 + TypeScript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', onClick }) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

#### NestJS 模块规范

```typescript
// ✅ 推荐：清晰的模块结构
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

---

## 🧪 测试体系

### 测试框架概览

| 层级         | 框架            | 应用        |
| ------------ | --------------- | ----------- |
| **单元测试** | Vitest          | 前端应用    |
| **单元测试** | Jest            | NestJS 后端 |
| **组件测试** | Testing Library | React 组件  |
| **E2E 测试** | Playwright      | 全栈集成    |
| **API 测试** | Supertest       | HTTP API    |

### 编写测试

#### 单元测试示例 (Vitest)

```typescript
// src/utils/__tests__/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '../format';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  it('should handle invalid date', () => {
    expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
  });
});
```

#### 组件测试示例 (Testing Library)

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

#### E2E 测试示例 (Playwright)

```typescript
// test/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

#### API 测试示例 (Supertest)

```typescript
// test/e2e/user.spec.ts
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:unit

# 运行 E2E 测试
pnpm test:e2e

# 测试覆盖率
pnpm test:cov

# 监听模式
pnpm test:watch

# 特定应用测试
pnpm test:react-vite
pnpm test:eggshell-nest
```

---

## 🚢 部署方案

### 🐳 后端部署 - Docker

#### 自动部署

项目配置了 GitHub Actions 自动构建和部署后端服务：

| 工作流文件          | 触发条件                 | 说明                   |
| ------------------- | ------------------------ | ---------------------- |
| `eggshell-nest.yml` | push 到 main/master 分支 | 构建 Docker 镜像并部署 |

**自动部署流程：**

1. **PR 阶段** - 运行类型检查、ESLint、单元测试、构建测试
2. **Push 阶段** - 构建 Docker 镜像并推送到镜像仓库

```yaml
# 触发路径
- 'apps/api/eggshell-nest/**'
- '.github/workflows/eggshell-nest.yml'
```

---

### ☁️ 前端部署 - 阿里云 OSS

#### 自动部署

项目配置了 GitHub Actions 自动部署到阿里云 OSS：

| 工作流文件              | 触发条件                 |
| ----------------------- | ------------------------ |
| `react-webpack-oss.yml` | push 到 main/master 分支 |

---

## 📊 性能监控

### 监控体系

项目集成了完整的性能监控解决方案：

| 类型            | 工具                     | 说明                 |
| --------------- | ------------------------ | -------------------- |
| **构建监控**    | Turbo                    | 增量构建分析         |
| **Bundle 分析** | rollup-plugin-visualizer | 产物大小分析         |
| **前端性能**    | Web Vitals               | Core Web Vitals 监控 |
| **后端性能**    | perf-monitor-nest        | 性能指标收集         |

### Bundle 分析

```bash
# 分析前端 bundle
pnpm analyze:react-vite
pnpm analyze:react-webpack

# 查看报告
open apps/frontend/react-vite/dist/stats.html
```

### 性能优化建议

1. **代码分割** - 使用 React.lazy 进行路由级代码分割
2. **Tree Shaking** - 确保只导入使用的代码
3. **压缩资源** - 使用 gzip/brotli 压缩
4. **缓存策略** - 合理设置 Cache-Control
5. **CDN 加速** - 静态资源使用 CDN

---

## 🔒 安全特性

### 安全措施

| 类别     | 实现                          |
| -------- | ----------------------------- |
| **认证** | JWT + Refresh Token           |
| **授权** | RBAC 角色权限控制             |
| **密码** | bcrypt 加密                   |
| **防护** | CORS、Rate Limiting、Helmet   |
| **验证** | Zod 参数校验                  |
| **加密** | crypto 工具库 (Node.js + Web) |

### 安全最佳实践

1. **敏感信息** - 使用环境变量，不提交 .env
2. **依赖更新** - 定期执行 `pnpm audit`
3. **代码审查** - 所有 PR 必须经过审查
4. **密钥轮换** - 定期更换 JWT Secret
5. **HTTPS** - 生产环境必须使用 HTTPS

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐**

Made with ❤️ by Eggshell Team

</div>
