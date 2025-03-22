import type { SelectProps } from 'antd/es/select';
import type { TreeSelectProps } from 'antd/es/tree-select';
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';
import type { InputProps } from 'antd/es/input';

// 搜索项类型定义
export type SearchItemType = 'input' | 'select' | 'datePicker' | 'rangePicker' | 'treeSelect';

// 基础搜索项配置
interface BaseSearchItem {
  label: string;
  name: string;
  type: SearchItemType;
  placeholder?: string;
  required?: boolean;
  rules?: any[];
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
  options: { label: string; value: any }[];
  selectProps?: SelectProps;
}

interface DatePickerSearchItem extends BaseSearchItem {
  type: 'datePicker';
  datePickerProps?: DatePickerProps;
}

interface RangePickerSearchItem extends BaseSearchItem {
  type: 'rangePicker';
  rangePickerProps?: RangePickerProps;
}

interface TreeSelectSearchItem extends BaseSearchItem {
  type: 'treeSelect';
  treeData: any[];
  treeSelectProps?: TreeSelectProps;
}

// 搜索项联合类型
export type SearchItem = InputSearchItem | SelectSearchItem | DatePickerSearchItem | RangePickerSearchItem | TreeSelectSearchItem;
