export const buttonVariants = ['filled', 'light', 'outline', 'transparent', 'white', 'subtle', 'default', 'gradient', 'primary'] as const;
export type ButtonVariant = (typeof buttonVariants)[number];

export const buttonSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type ButtonSize = (typeof buttonSizes)[number];

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 按钮的变体
   */
  variant?: ButtonVariant;
  /**
   * 按钮大小
   */
  size?: ButtonSize;
  /**
   * 按钮内容
   */
  children?: React.ReactNode;
  /**
   * 是否禁用按钮
   */
  disabled?: boolean;
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
  /**
   * 按钮宽度是否撑满父容器
   */
  fullWidth?: boolean;
  /**
   * 左侧图标
   */
  leftIcon?: React.ReactNode;
  /**
   * 右侧图标
   */
  rightIcon?: React.ReactNode;
}
