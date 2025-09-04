import { ReactNode } from 'react';

export interface ModalProps {
  /**
   * 是否可见
   */
  open: boolean;
  /**
   * 标题
   */
  title?: string;
  /**
   * 取消回调
   */
  onCancel: () => void;
  /**
   * 确定回调
   */
  onOk?: () => void | Promise<void>;
  /**
   * 内容
   */
  children: React.ReactNode;
  /**
   * 确认按钮加载状态
   */
  confirmLoading?: boolean;
  /**
   * 底部
   */
  footer?: React.ReactNode;
  /**
   * 宽度
   */
  width?: number | string;
  /**
   * 样式配置
   */
  styles?: {
    mask?: React.CSSProperties;
    wrapper?: React.CSSProperties;
    header?: React.CSSProperties;
    body?: React.CSSProperties;
    footer?: React.CSSProperties;
    content?: React.CSSProperties;
  };
}

export interface ConfirmModalProps {
  /**
   * 标题
   */
  title?: ReactNode;
  /**
   * 图标
   */
  icon?: ReactNode;
  /**
   * 内容
   */
  content?: ReactNode;
  /**
   * 确定按钮文本
   */
  okText?: string;
  /**
   * 取消按钮文本
   */
  cancelText?: string;
  /**
   * 确定按钮类型
   */
  okType?: 'primary' | 'danger';
  /**
   * 确定按钮属性
   */
  okButtonProps?: {
    disabled?: boolean;
    [key: string]: any;
  };
  /**
   * 取消按钮属性
   */
  cancelButtonProps?: {
    disabled?: boolean;
    [key: string]: any;
  };
  /**
   * 确定回调
   */
  onOk?: () => void | Promise<void>;
  /**
   * 取消回调
   */
  onCancel?: () => void;
  /**
   * 宽度
   */
  width?: number | string;
  /**
   * 居中
   */
  centered?: boolean;
  /**
   * 自动聚焦
   */
  autoFocusButton?: 'ok' | 'cancel' | null;
  /**
   * 关闭后销毁
   */
  destroyOnClose?: boolean;
}
