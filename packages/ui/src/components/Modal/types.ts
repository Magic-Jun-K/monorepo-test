import React from 'react';

export interface ModalProps {
  /**
   * 是否显示模态框
   */
  isOpen: boolean;
  /**
   * 关闭模态框的回调函数
   */
  onClose: () => void;
  /**
   * 模态框标题
   */
  title?: React.ReactNode;
  /**
   * 模态框内容
   */
  children?: React.ReactNode;
  /**
   * 模态框宽度，支持数字（px）或字符串（如 '50%'）
   */
  width?: number | string;
  /**
   * 是否显示关闭按钮
   */
  showCloseButton?: boolean;
  /**
   * 点击遮罩层是否可以关闭
   */
  closeOnOverlayClick?: boolean;
  /**
   * 自定义页脚内容
   */
  footer?: React.ReactNode;
}
