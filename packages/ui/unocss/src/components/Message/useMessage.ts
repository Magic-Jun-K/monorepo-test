import { useState, useMemo, createContext, createElement } from 'react';
import type { FC, ReactElement } from 'react';

import { MessageConfig, MessageConfigBase, MessageInstance } from './types';

interface MessageItem extends MessageConfig {
  id: string;
}

// 创建Context
const MessageContext = createContext<MessageInstance | null>(null);

// 创建useMessage hook
export const useMessage = (): [MessageInstance, ReactElement] => {
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // 其他函数保持不变
  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  // 手动关闭加载消息
  const messageApi = useMemo((): MessageInstance => {
    const addMessage = (config: MessageConfigBase, type: MessageItem['type']) => {
      const id = Math.random().toString(36).slice(2, 11);
      const newMessage: MessageItem = {
        id,
        ...config,
        type,
      };

      setMessages((prev) => [...prev, newMessage]);

      // 自动关闭
      if (newMessage.duration !== 0) {
        const duration = (newMessage.duration || 3) * 1000;
        setTimeout(() => {
          removeMessage(id);
          if (newMessage.onClose) newMessage.onClose();
        }, duration);
      }
    };

    const closeLoading = (id: string) => {
      return () => removeMessage(id);
    };

    return {
      success: (config) =>
        addMessage(typeof config === 'string' ? { content: config } : config, 'success'),
      error: (config) =>
        addMessage(typeof config === 'string' ? { content: config } : config, 'error'),
      warning: (config) =>
        addMessage(typeof config === 'string' ? { content: config } : config, 'warning'),
      info: (config) =>
        addMessage(typeof config === 'string' ? { content: config } : config, 'info'),
      loading: (config) => {
        const id = Math.random().toString(36).slice(2, 11);
        const loadingConfig: MessageConfig =
          typeof config === 'string'
            ? { content: config, type: 'loading' }
            : { ...config, type: 'loading' };
        addMessage({ ...loadingConfig, duration: 0 }, 'loading');
        return closeLoading(id);
      },
      open: (config) => {
        if (typeof config === 'string') {
          // 如果是字符串，需要指定类型，这里默认使用info类型
          addMessage({ content: config }, 'info');
        } else {
          const { type } = config;
          addMessage(config, type);
        }
      },
    };
  }, []);

  const MessageComponent = createElement(
    MessageContext.Provider,
    { value: messageApi },
    createElement(MessageInner, { messages: messages }),
  );

  return [messageApi, MessageComponent];
};

// 内部组件，用于渲染消息
const MessageInner: FC<{ messages: MessageItem[] }> = ({ messages }) => {
  return createElement(
    'div',
    { className: 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50' },
    messages.map((msg) =>
      createElement(
        'div',
        {
          key: msg.id,
          className: `px-4 py-2 rounded shadow-lg mb-2 flex items-center ${msg.className || ''}`,
          style: msg.style,
        },
        [
          createElement('span', null, msg.content),
          msg.type === 'loading' &&
            createElement('div', {
              className:
                'ml-2 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin',
            }),
        ],
      ),
    ),
  );
};
