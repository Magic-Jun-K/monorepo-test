export const buttonVariants = ['filled', 'light', 'outline', 'transparent', 'white', 'subtle', 'default', 'gradient'] as const;
export type ButtonVariant = (typeof buttonVariants)[number];

export interface ButtonProps {
  /**
   * 按钮的变体
   */
  variant?: ButtonVariant;
  /**
   * 按钮内容
   */
  children?: React.ReactNode;
  /**
   * 是否禁用按钮
   */
  disabled?: boolean;
}
