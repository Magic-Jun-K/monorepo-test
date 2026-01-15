import React from 'react';

export interface ColumnType<T> {
  title: string;
  dataIndex?: string;
  key: string;
  width?: number | string;
  render?: (text: unknown, record: T, index: number) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
  sortOrder?: 'ascend' | 'descend' | null;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = unknown> {
  dataSource: T[];
  columns: ColumnType<T>[];
  rowKey?: string | ((record: T) => string);
  pagination?: boolean | {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  loading?: boolean;
  bordered?: boolean;
  size?: 'small' | 'middle' | 'large';
  scroll?: {
    x?: number | string | boolean;
    y?: number | string;
  };
  rowSelection?: {
    selectedRowKeys: React.Key[];
    onChange: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  };
  onRow?: (record: T, index?: number) => React.HTMLAttributes<HTMLElement>;
  onHeaderRow?: (columns: ColumnType<T>[], index?: number) => React.HTMLAttributes<HTMLElement>;
}
