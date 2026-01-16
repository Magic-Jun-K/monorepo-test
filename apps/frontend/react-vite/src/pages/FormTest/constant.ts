import { SearchItem } from '@eggshell/ui-antd';

// 搜索项配置 - 性能指标字段
export const SEARCH_ITEMS: SearchItem[] = [
  {
    label: '项目标识',
    name: 'project',
    type: 'input',
    placeholder: '请输入项目标识',
  },
  {
    label: '页面URL',
    name: 'url',
    type: 'input',
    placeholder: '请输入页面URL',
  },
  {
    label: '浏览器类型',
    name: 'browser',
    type: 'select',
    options: [
      { label: 'Chrome', value: 'Chrome' },
      { label: 'Firefox', value: 'Firefox' },
      { label: 'Safari', value: 'Safari' },
      { label: 'Edge', value: 'Edge' },
    ],
    placeholder: '请选择浏览器类型',
  },
  {
    label: '时间范围',
    name: 'timeRange',
    type: 'rangePicker',
    placeholder: ['开始时间', '结束时间'],
  },
  {
    label: '指标类型',
    name: 'metricType',
    type: 'select',
    options: [
      { label: 'FCP', value: 'fcp' },
      { label: 'LCP', value: 'lcp' },
      { label: 'CLS', value: 'cls' },
      { label: 'INP', value: 'inp' },
    ],
    placeholder: '请选择指标类型',
  },
  {
    label: '状态码',
    name: 'status',
    type: 'select',
    options: [
      { label: '200', value: '200' },
      { label: '404', value: '404' },
      { label: '500', value: '500' },
    ],
    placeholder: '请选择状态码',
  },
];

export interface PerformanceDataType {
  id: number;
  project: string;
  url: string;
  browser: string;
  fcp: number;
  lcp: number;
  cls: number;
  inp: number;
  status: number;
  timestamp: string;
}

export const COLUMNS = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 140,
    sorter: (a: PerformanceDataType, b: PerformanceDataType) => a.id - b.id,
  },
  {
    title: '项目标识',
    dataIndex: 'project',
    key: 'project',
  },
  {
    title: '页面URL',
    dataIndex: 'url',
    key: 'url',
  },
  {
    title: '浏览器',
    dataIndex: 'browser',
    key: 'browser',
  },
  {
    title: 'FCP(ms)',
    dataIndex: 'fcp',
    key: 'fcp',
  },
  {
    title: 'LCP(ms)',
    dataIndex: 'lcp',
    key: 'lcp',
  },
  {
    title: 'CLS',
    dataIndex: 'cls',
    key: 'cls',
  },
  {
    title: 'INP(ms)',
    dataIndex: 'inp',
    key: 'inp',
  },
  {
    title: '状态码',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '时间戳',
    dataIndex: 'timestamp',
    key: 'timestamp',
  },
];
