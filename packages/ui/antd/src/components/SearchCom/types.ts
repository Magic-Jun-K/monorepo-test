import type { SelectProps } from 'antd/es/select';
import type { TreeSelectProps } from 'antd/es/tree-select';
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';
import type { InputProps } from 'antd/es/input';
import type { FormInstance, Rule } from 'antd/es/form';
import type { DataNode } from 'antd/es/tree';

// 组件Props属性定义
export interface SearchComProps {
  items: SearchItem[];
  initialValues?: Record<string, unknown>;
  onSearch?: (values: Record<string, unknown>) => void;
  onReset?: () => void;
  form?: FormInstance;
  className?: string;
  showResetButton?: boolean;
  showSearchButton?: boolean;
  searchButtonText?: string;
  resetButtonText?: string;
  searchLoading?: boolean;
  resetLoading?: boolean;
  colConfig?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  rowGutter?: [number, number];
}

// 搜索项类型定义
export type SearchItemType = 'input' | 'select' | 'datePicker' | 'rangePicker' | 'treeSelect';

// 基础搜索项配置
interface BaseSearchItem {
  label: string;
  name: string;
  type: SearchItemType;
  placeholder?: string;
  required?: boolean;
  rules?: Rule[];
  colSpan?: number; // 栅格列数，默认为6（总共24列）
  hidden?: boolean;
  disabled?: boolean;
}

// 各类型搜索项特有配置
interface InputSearchItem extends BaseSearchItem {
  type: 'input';
  inputProps?: InputProps;
}

interface SelectSearchItem extends BaseSearchItem {
  type: 'select';
  options: { label: string; value: string | number }[];
  selectProps?: SelectProps;
}

export interface DatePickerSearchItem extends BaseSearchItem {
  type: 'datePicker';
  datePickerProps?: DatePickerProps;
  format?: string;
}

export interface RangePickerSearchItem extends Omit<BaseSearchItem, 'placeholder'> {
  type: 'rangePicker';
  placeholder?: [string, string]; // 元组类型
  rangePickerProps?: RangePickerProps;
  format?: string;
}

interface TreeSelectSearchItem extends BaseSearchItem {
  type: 'treeSelect';
  treeData: DataNode[];
  treeSelectProps?: TreeSelectProps;
}

// 搜索项联合类型
export type SearchItem =
  | InputSearchItem
  | SelectSearchItem
  | DatePickerSearchItem
  | RangePickerSearchItem
  | TreeSelectSearchItem;
