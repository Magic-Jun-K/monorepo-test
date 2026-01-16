# Input 输入框

基于 shadcn/ui 的 Input 组件进行二次开发，实现了类似 Ant Design 5.x 风格的输入框组件。

## 设计理念

该组件遵循 Ant Design 5.x 的设计规范，提供了三种变体、三种尺寸和两种状态样式，同时支持前缀和后缀图标。

## 使用示例

```tsx
import { Input } from '@/components/common/Input';

// 基础使用
<Input placeholder="请输入内容" />

// 不同尺寸
<Input size="sm" placeholder="小尺寸" />
<Input size="md" placeholder="默认尺寸" />
<Input size="lg" placeholder="大尺寸" />

// 不同变体
<Input variant="outlined" placeholder="带边框 (默认)" />
<Input variant="filled" placeholder="填充背景" />
<Input variant="borderless" placeholder="无边框" />

// 状态
<Input status="error" placeholder="错误状态" />
<Input status="warning" placeholder="警告状态" />

// 前缀和后缀
<Input prefix={<User className="h-4 w-4" />} placeholder="用户名" />
<Input suffix=".com" placeholder="网站" />

// 清除图标
<Input allowClear placeholder="输入内容后显示清除图标" />
```

## API

### InputProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| size | 控件大小 | `sm` \| `md` \| `lg` | `md` |
| variant | 控件变体 | `outlined` \| `filled` \| `borderless` | `outlined` |
| status | 状态 | `error` \| `warning` | - |
| prefix | 前缀图标 | `ReactNode` | - |
| suffix | 后缀图标 | `ReactNode` | - |
| allowClear | 是否显示清除图标 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| className | 自定义类名 | `string` | - |

以及其他所有原生 input 元素的属性。

## 变体说明

- `outlined`: 带边框的输入框（默认）
- `filled`: 填充背景的输入框
- `borderless`: 无边框的输入框

## 尺寸说明

- `sm`: 小尺寸 (高度 32px)
- `md`: 中等尺寸 (高度 36px)
- `lg`: 大尺寸 (高度 40px)

## 状态说明

- `error`: 错误状态，红色边框和聚焦效果
- `warning`: 警告状态，黄色边框和聚焦效果

## 清除图标说明

当设置 `allowClear` 为 `true` 时，输入框会在有内容且未禁用的情况下显示清除图标。点击清除图标会清空输入框内容并聚焦到输入框。

## 注意事项

1. 该组件基于 shadcn/ui 的 Input 组件进行二次开发，保持了原有组件的所有功能。
2. 当使用 prefix 或 suffix 时，组件会自动包装输入框以提供更好的布局效果。
3. 所有原生 input 元素的属性都可以直接传递给该组件。
4. 清除图标会替换 suffix 图标，如果同时设置了 suffix 和 allowClear，会在清除图标和 suffix 之间添加分隔符。