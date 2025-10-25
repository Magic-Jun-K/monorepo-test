import { ReactNode } from 'react';

export interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}

export interface DialogProps {
  /**
   * 控制对话框是否打开
   */
  open?: boolean;
  /**
   * 对话框打开状态改变时的回调
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * 是否居中显示
   */
  centered?: boolean;
  /**
   * 自定义底部内容
   */
  footer?: ReactNode;
  /**
   * 确认按钮文字
   * @default 'OK'
   */
  okText?: ReactNode;
  /**
   * 取消按钮文字
   * @default 'Cancel'
   */
  cancelText?: ReactNode;
  /**
   * 确认按钮属性
   */
  okButtonProps?: ButtonProps;
  /**
   * 取消按钮属性
   */
  cancelButtonProps?: ButtonProps;
  /**
   * 点击确认按钮回调
   */
  onOk?: () => void;
  /**
   * 点击取消按钮回调
   */
  onCancel?: () => void;
  /**
   * 对话框标题
   */
  title?: ReactNode;
  /**
   * 对话框描述（用于可访问性）
   */
  description?: string;
  /**
   * 对话框内容
   */
  children?: ReactNode;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 其他属性
   */
  [key: string]: any;
}