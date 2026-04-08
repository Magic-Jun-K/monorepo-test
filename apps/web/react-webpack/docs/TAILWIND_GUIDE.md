# Tailwind CSS 4.x 集成指南

本项目已成功集成 Tailwind CSS 4.x 最新版本！🎉

## 🚀 快速开始

### 1. 安装依赖
```bash
pnpm add -D tailwindcss@next @tailwindcss/postcss@next postcss
```

### 2. 配置文件

#### `tailwind.config.mjs`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Fira Code', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
}
```

#### `postcss.config.mjs`
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    // 其他PostCSS插件可以在这里添加
  }
}
```

### 3. 引入样式

在 `src/index.tsx` 中引入Tailwind CSS：
```typescript
import './styles/tailwind.css';
```


### 4. 创建样式文件

创建 `src/styles/tailwind.css`：
```css
/* Tailwind CSS 4.x 主样式文件 */
@import "tailwindcss";

/* 自定义基础样式 */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply antialiased;
  }
}

/* 自定义组件层 */
@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
  }
}

/* 自定义工具类 */
@layer utilities {
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

## 🎨 使用示例

### 基础样式
```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Hello Tailwind CSS 4.x!
</div>
```

### 响应式设计
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 内容 -->
</div>
```

### 动画效果
```jsx
<div className="animate-bounce">弹跳动画</div>
<div className="animate-pulse">脉冲动画</div>
<div className="animate-spin">旋转动画</div>
```

### 悬停效果
```jsx
<button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
  悬停按钮
</button>
```

## 🔧 Webpack配置

确保在 `webpack.config.mjs` 中正确配置CSS处理：
```javascript
{
  test: /\.css$/,
  use: [
    isProd ? MiniCssExtractPlugin.loader : 'style-loader', 
    'css-loader',
    'postcss-loader'
  ]
}
```

## 📱 开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看效果！

## 🎯 特性

- ✅ **现代化设计系统** - 使用最新的设计token
- ✅ **高性能** - 只生成使用的CSS样式
- ✅ **响应式优先** - 移动端优先的设计理念
- ✅ **丰富的工具类** - 大量的预定义工具类
- ✅ **动画支持** - 内置多种动画效果
- ✅ **暗色模式** - 支持暗色主题
- ✅ **自定义主题** - 可扩展的颜色和字体系统

## 📚 学习资源

- [Tailwind CSS 官方文档](https://tailwindcss.com/docs)
- [Tailwind CSS 组件库](https://tailwindui.com/)
- [Tailwind CSS 速查表](https://tailwindcss.com/docs/utility-first)

## 💡 最佳实践

1. **移动优先** - 默认设计移动端，然后适配大屏幕
2. **组合使用** - 组合多个工具类创建复杂样式
3. **自定义配置** - 根据项目需求扩展主题配置
4. **性能优化** - 使用 `content` 配置确保只生成使用的样式

## 🚀 开始构建你的界面吧！