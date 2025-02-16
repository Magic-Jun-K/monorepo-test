import type { ReactElement } from 'react';

export type TriggerType = 'hover' | 'click';
export type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface DropdownProps {
  /**
   * 触发元素
   */
  children: ReactElement;
  /**
   * 下拉内容
   */
  overlay: ReactElement;
  /**
   * 触发方式
   */
  trigger?: TriggerType;
  /**
   * 弹出位置
   */
  placement?: Placement;
  /**
   * 自定义类名
   */
  className?: string;
} 