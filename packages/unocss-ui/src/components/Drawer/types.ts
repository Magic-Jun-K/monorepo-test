import { ReactNode } from 'react';

export type DrawerProps = {
  /**
   * 是否显示抽屉
   */
  open: boolean;
  /**
   * 关闭抽屉的回调函数
   */
  onClose: () => void;
  /**
   * 抽屉标题内容
   */
  title?: ReactNode;
  /**
   * 抽屉出现的位置，可选 left/right/top/bottom
   */
  placement?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * 抽屉宽度，支持字符串（如 '50%'）或数字（px），仅左右方向生效
   */
  width?: string | number;
  /**
   * 抽屉高度，支持字符串（如 '50%'）或数字（px），仅上下方向生效
   */
  height?: string | number;
  /**
   * 抽屉内容区
   */
  children?: ReactNode;
  /**
   * 点击遮罩层是否可以关闭抽屉，默认 true
   */
  maskClosable?: boolean;
  /**
   * 是否显示关闭按钮，默认 true
   */
  showClose?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 是否显示底部区域
   */
  showFooter?: boolean;
  /**
   * 自定义底部内容
   */
  footer?: React.ReactNode;
  /**
   * 点击“确定”按钮的回调
   */
  onOk?: () => void;
  /**
   * 点击“取消”按钮的回调
   */
  onCancel?: () => void;
};
