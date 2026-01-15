# Message 组件

Message 组件提供了两种使用方式，与 Ant Design 5.26.5 版本保持一致：

## 1. 静态方法

```jsx
import { message } from '@eggshell/ui-unocss';

// 在任何地方调用
message.success('Success!');
message.error('Error!');
message.warning('Warning!');
message.info('Info!');
message.loading('Loading...');
message.open({ type: 'success', content: 'Custom message' });
```

## 2. Hook 方式

```jsx
import { message } from '@eggshell/ui-unocss';

const MyComponent = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const showSuccess = () => {
    messageApi.success('Success!');
  };

  return (
    <div>
      {contextHolder}
      <button onClick={showSuccess}>Show Success</button>
    </div>
  );
};
```

或者直接导入useMessage hook：

```jsx
import { useMessage } from '@eggshell/ui-unocss';

const MyComponent = () => {
  const [messageApi, contextHolder] = useMessage();

  const showSuccess = () => {
    messageApi.success('Success!');
  };

  return (
    <div>
      {contextHolder}
      <button onClick={showSuccess}>Show Success</button>
    </div>
  );
};
```

## API

### 静态方法

- `message.success(content: string | MessageConfigBase)`
- `message.error(content: string | MessageConfigBase)`
- `message.warning(content: string | MessageConfigBase)`
- `message.info(content: string | MessageConfigBase)`
- `message.loading(content: string | MessageConfigBase)`
- `message.open(config: MessageConfig)`

### Hook 方法

- `const [messageApi, contextHolder] = message.useMessage();`

各方法的参数类型与静态方法一致：
- `messageApi.success(content: string | MessageConfigBase)`
- `messageApi.error(content: string | MessageConfigBase)`
- `messageApi.warning(content: string | MessageConfigBase)`
- `messageApi.info(content: string | MessageConfigBase)`
- `messageApi.loading(content: string | MessageConfigBase)`
- `messageApi.open(config: MessageConfig)`

### 类型定义

如果需要使用类型定义，可以从包中导入：

```ts
import { MessageConfig, MessageConfigBase, MessageInstance } from '@eggshell/ui-unocss';
```

### MessageConfigBase

```ts
interface MessageConfigBase {
  content: string | React.ReactNode;
  duration?: number; // 自动关闭的延时，单位秒。设为 0 时不自动关闭
  onClose?: () => void; // 关闭时触发的回调函数
  key?: string; // 当前提示的唯一标识符
  className?: string; // 自定义 CSS class
  style?: React.CSSProperties; // 自定义内联样式
}
```

### MessageConfig

```ts
interface MessageConfig extends MessageConfigBase {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
}
```

### MessageOpenConfig

```ts
interface MessageOpenConfig extends MessageConfig {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
}
```