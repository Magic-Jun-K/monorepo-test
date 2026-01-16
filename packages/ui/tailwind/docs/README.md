# TailwindCSS UI 组件库

基于 shadcn/ui 设计系统的现代化 React UI 组件库，使用 TailwindCSS v4 构建，支持二次开发和自定义业务组件。

## 🚀 特性

- ✅ 基于 shadcn/ui 设计系统
- 🎨 支持 TailwindCSS v4 最新特性
- 🌙 内置深色模式和主题定制
- 📦 可复用的基础组件
- 🔧 易于扩展和二次开发
- 🎯 完整的 TypeScript 支持
- 📱 响应式设计
- ⚡ 使用 Rolldown-Vite 构建，性能更优

## 📦 技术栈

- **React 18.3** - 最新 React 版本
- **TailwindCSS v4** - 最新 TailwindCSS 版本
- **shadcn/ui** - 现代化组件设计系统
- **Radix UI** - 无障碍访问基础组件
- **Lucide React** - 图标库
- **Rolldown-Vite** - 高性能构建工具

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📚 使用说明

### 基础使用

```tsx
import { Button } from '@/components';

function App() {
  return (
    <div className="p-4">
      <Button>默认按钮</Button>
      <Button variant="destructive">危险按钮</Button>
      <Button variant="outline">轮廓按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="link">链接按钮</Button>
    </div>
  );
}
```

### 添加 shadcn/ui 组件

使用 shadcn CLI 添加官方组件：

```bash
# 进入项目目录
cd packages/tailwindcss-ui

# 使用 shadcn CLI 添加组件
npx shadcn@latest add button card dialog
```

### 创建自定义业务组件

1. 在 `src/components/business/` 目录下创建你的业务组件
2. 使用现有的设计令牌（colors, spacing, etc.）
3. 在 `src/components/index.ts` 中导出你的组件

示例：

```tsx
// src/components/business/custom-card.tsx
import { cn } from '@/lib/utils';

interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // 自定义属性
}

export function CustomCard({ className, ...props }: CustomCardProps) {
  return (
    <div 
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}
```

## 🎨 主题定制

### CSS 变量主题

在 `src/styles/globals.css` 中修改 CSS 变量来自定义主题：

```css
@theme {
  /* 自定义颜色 */
  --color-primary: hsl(222.2 47.4% 11.2%);
  --color-primary-foreground: hsl(210 40% 98%);
  
  /* 自定义圆角 */
  --radius: 0.5rem;
  
  /* 更多自定义变量... */
}
```

### TailwindCSS v4 配置

项目使用 TailwindCSS v4，配置文件为 `tailwind.config.js`，支持：

- 现代化的颜色系统
- 增强的响应式设计
- 优化的构建性能

## 📁 项目结构

```
src/
├── components/
│   ├── ui/          # shadcn/ui 基础组件
│   ├── business/    # 自定义业务组件
│   └── index.ts     # 组件导出
├── lib/
│   ├── utils.ts     # 工具函数（cn, clsx, tailwind-merge）
│   └── index.ts     # 工具导出
├── styles/
│   └── globals.css  # 全局样式和 CSS 变量主题
├── assets/          # 静态资源
└── ...
```

## 🔧 构建组件库

### 开发构建

```bash
npm run build
```

### 组件库构建

```bash
npm run build:lib
```

### 代码检查

```bash
npm run lint
```

## 📄 可用组件

### 基础组件

- [x] **Button** - 按钮组件，支持多种变体
- [ ] 更多组件可通过 shadcn CLI 添加

### 计划添加的组件

- [ ] Card - 卡片组件
- [ ] Dialog - 对话框组件
- [ ] Form - 表单组件
- [ ] Input - 输入框组件
- [ ] Label - 标签组件
- [ ] Toast - 提示组件

## 🛠️ 开发指南

### 添加新组件

1. 使用 shadcn CLI 添加官方组件
2. 或者手动创建自定义组件
3. 遵循组件设计规范
4. 添加 TypeScript 类型定义
5. 在 `src/components/index.ts` 中导出

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 使用语义化的 CSS 类名
- 确保组件的无障碍访问性

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 贡献内容

- 🆕 添加新的 shadcn/ui 组件
- 🎨 创建自定义业务组件
- 🔧 优化现有组件
- 📚 改进文档和示例
- 🐛 修复 Bug
- ✨ 提出新特性

## 📄 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件

## 🔗 相关链接

- [shadcn/ui 官方文档](https://ui.shadcn.com)
- [TailwindCSS v4 文档](https://tailwindcss.com/docs)
- [Radix UI 文档](https://radix-ui.com)
- [Lucide React 图标](https://lucide.dev)
