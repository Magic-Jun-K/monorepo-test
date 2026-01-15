import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '../Button';
import type { ConfirmModalProps } from './types';

export const ConfirmModal = ({
  title,
  icon,
  content,
  okText = '确定',
  cancelText = '取消',
  okType = 'primary',
  okButtonProps,
  cancelButtonProps,
  onOk,
  onCancel,
  onError,
  width = 416,
  centered = true,
  autoFocusButton = 'ok',
  destroyOnClose = false,
}: ConfirmModalProps & { destroy?: () => void; onError?: (error: unknown) => void }) => {
  const [visible, setVisible] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  useEffect(() => {
    if (!visible && destroyOnClose) {
      const timer = setTimeout(() => {
        setMounted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, destroyOnClose]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleOk = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (onOk) {
        const result = onOk();
        if (result instanceof Promise) {
          setConfirmLoading(true);
          await result;
        }
      }
      setVisible(false);
    } catch (error) {
      // 通知父组件发生了错误
      if (onError) {
        onError(error);
      }
      // 在错误情况下也关闭模态框
      setVisible(false);
    } finally {
      setConfirmLoading(false);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (isProcessing) return; // 防止在处理过程中重复点击

    setVisible(false);
    onCancel?.();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-opacity ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        zIndex: 1000,
      }}
    >
      <div
        className={`bg-white rounded-lg w-full transition-all transform ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          maxWidth: typeof width === 'number' ? `${width}px` : width,
          margin: centered ? 'auto' : undefined,
        }}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-3">
            {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              {content && <div className="text-gray-600">{content}</div>}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <Button
            onClick={handleCancel}
            {...cancelButtonProps}
            ref={(ref) => {
              if (ref && autoFocusButton === 'cancel') {
                ref.focus();
              }
            }}
          >
            {cancelText}
          </Button>
          <Button
            type={okType === 'danger' ? 'primary' : okType}
            onClick={handleOk}
            loading={confirmLoading}
            danger={okType === 'danger'}
            {...okButtonProps}
            ref={(ref) => {
              if (ref && autoFocusButton === 'ok') {
                ref.focus();
              }
            }}
          >
            {okText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
