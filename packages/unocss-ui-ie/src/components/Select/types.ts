interface SelectOption {
  /**
   * 标签
   */
  label: string;
  /**
   * 值
   */
  value: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

export interface SelectProps {
  /**
   * 选项
   */
  options: SelectOption[];
  /**
   * 值
   */
  value?: string;
  /**
   * 值变化回调
   */
  onChange?: (value: string) => void;
  /**
   * 占位符
   */
  placeholder?: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}
