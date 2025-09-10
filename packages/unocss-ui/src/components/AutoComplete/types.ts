export interface SuggestionItem {
  /**
   * 值
   */
  value: string | number;
  /**
   * 标签
   */
  label: string;
  /**
   * 其他属性
   */
  [key: string]: unknown;
}

export interface AutoCompleteProps {
  /**
   * 值
   */
  value?: string;
  /**
   * 默认值
   */
  defaultValue?: string;
  /**
   * 选项
   */
  options?: SuggestionItem[];
  /**
   * 值变化
   */
  onChange?: (value: string) => void;
  /**
   * 选择
   */
  onSelect?: (item: SuggestionItem) => void;
  /**
   * 搜索
   */
  onSearch?: (value: string) => void;
  /**
   * 防抖时间
   */
  debounce?: number;
  /**
   * 占位符
   */
  placeholder?: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 是否允许清除
   */
  allowClear?: boolean;
  /**
   * 是否过滤选项
   */
  filterOption?: boolean | ((inputValue: string, option: SuggestionItem) => boolean);
  /**
   * 是否默认激活第一个选项
   */
  defaultActiveFirstOption?: boolean;
  /**
   * 选项的值
   */
  valueKey?: string;
  /**
   * 选项的标签
   */
  labelKey?: string;
  /**
   * 样式
   */
  style?: React.CSSProperties;
  /**
   * 是否显示下拉框（受控模式）
   */
  open?: boolean;
}