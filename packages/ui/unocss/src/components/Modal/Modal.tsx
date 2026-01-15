/**
 * @file Modal.tsx
 * @description 模态框组件
 */
import { useEffect, createElement } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '../Button';
import { ConfirmModal } from './ConfirmModal';
import type { ModalProps, ConfirmModalProps } from './types';

export const Modal = ({
  open,
  title,
  onCancel,
  onOk,
  children,
  footer,
  width = 520,
  styles = {},
  confirmLoading = false,
}: ModalProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleMaskClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel?.();
    }
  };

  if (!open) return null;

  return createPortal(
    <button
      type="button"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-1000"
      style={styles.mask}
      onClick={handleMaskClick}
    >
      <div
        className="bg-white rounded-lg w-full"
        style={{
          maxWidth: typeof width === 'number' ? `${width}px` : width,
          ...styles.wrapper,
        }}
      >
        <div
          className="p-4 border-b border-gray-200 flex justify-between items-center relative"
          style={styles.header}
        >
          {title !== undefined && <h3 className="text-lg font-semibold">{title}</h3>}
          <button
            onClick={onCancel}
            className="absolute top-1/2 right-4 -translate-y-1/2 z-10 p-0 w-8 h-8 border-0 rounded-md bg-transparent cursor-pointer text-base flex items-center justify-center text-gray-400 transition-all hover:text-gray-600 hover:bg-black/[0.03] active:text-gray-800 active:bg-black/[0.06]"
          >
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="close"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
            </svg>
          </button>
        </div>

        <div className="p-4" style={styles.body}>
          {children}
        </div>

        {footer === undefined ? (
          <div
            className="p-4 border-t border-gray-200 flex justify-end gap-2"
            style={styles.footer}
          >
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={onOk} loading={confirmLoading}>
              确定
            </Button>
          </div>
        ) : (
          footer
        )}
      </div>
    </button>,
    document.body,
  );
};

// 静态方法
Modal.confirm = (props: ConfirmModalProps) => {
  return new Promise<void>((resolve, reject) => {
    // 创建一个容器来渲染ConfirmModal
    const container = document.createElement('div');
    document.body.appendChild(container);

    let isResolved = false;
    let isRejected = false;
    let root: { unmount?: () => void; render?: (node: ReactNode) => void } | null = null;

    const destroy = () => {
      if (root) {
        try {
          if (root.unmount) {
            root.unmount();
          } else if (root.render) {
            root.render(null);
          }
        } catch {
          // ignore errors during unmount（销毁时忽略错误）
        }
        root = null;
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    // 创建props副本，添加resolve和reject处理
    const modalProps = {
      ...props,
      destroy,
      onOk: async () => {
        if (isResolved || isRejected) return;

        try {
          if (props.onOk) {
            const result = props.onOk();
            if (result instanceof Promise) {
              await result;
            }
          }
          isResolved = true;
          resolve();
          setTimeout(destroy, 300);
        } catch (error) {
          if (!isRejected) {
            isRejected = true;
            reject(error);
            setTimeout(destroy, 300);
          }
        }
      },
      onError: (error: unknown) => {
        if (!isRejected) {
          isRejected = true;
          reject(error);
          setTimeout(destroy, 300);
        }
      },
      onCancel: () => {
        if (isResolved || isRejected) return;

        // 取消操作不应该reject Promise，而是resolve但不执行删除逻辑
        isResolved = true;
        props.onCancel?.();
        resolve();
        setTimeout(destroy, 300);
      },
    };

    // 使用React.createElement创建ConfirmModal元素
    const modalElement = createElement(ConfirmModal, modalProps);

    // 使用ReactDOM.createRoot进行渲染
    // 使用动态导入确保兼容性
    import('react-dom/client')
      .then(({ createRoot }) => {
        const newRoot = createRoot(container);
        root = newRoot;
        newRoot.render(modalElement);
      })
      .catch(() => {
        // 如果现代API不可用，直接抛出错误
        if (!isRejected) {
          isRejected = true;
          reject(new Error('Failed to render modal: react-dom/client not supported'));
        }
        destroy();
      });
  });
};
