import React, { forwardRef, useMemo, useEffect } from 'react';
import { useLayoutContext } from '../../context/LayoutContext';
import { Table, TableProps, PaginationProps } from 'antd';
import type { TableRef } from 'antd/es/table';
import clsx from 'clsx';
import { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';

import styles from './index.module.css';

// 类型定义
type TableComProps<T> = TableProps<T> & {
  pagination?: PaginationProps | false;
  showPagination?: boolean;
  defaultPageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
};

const TableCom = forwardRef<TableRef, TableComProps<any>>((props, ref) => {
  const { className, pagination, showPagination = true, defaultPageSize = 10, onChange, onPageChange, ...restProps } = props;
  const { searchHeight } = useLayoutContext();

  // 添加useEffect监听searchHeight变化
  useEffect(() => {
    console.log('searchHeight变化:', searchHeight);
  }, [searchHeight]);

  // 合并分页配置
  const mergedPagination = useMemo(() => {
    if (pagination === false || !showPagination) return false;

    return {
      showSizeChanger: true, // 显示每页大小切换器
      showQuickJumper: true, // 显示快速跳转输入框
      defaultPageSize, // 默认每页大小
      pageSizeOptions: [10, 20, 50, 100], // 每页大小选项
      ...pagination,
      onChange: (page: number, pageSize: number) => {
        onPageChange?.(page, pageSize);
        pagination?.onChange?.(page, pageSize);
      }
    };
  }, [pagination, showPagination, defaultPageSize, onPageChange]);

  // 处理表格变化事件
  const handleTableChange = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<any> | SorterResult<any>[],
    extra: TableCurrentDataSource<any>
  ) => {
    onChange?.(pagination, filters, sorter, extra);
  };
  console.log("测试restProps", restProps);
  console.log("测试searchHeight", searchHeight);

  return (
    <div className={clsx(styles['combined-table-container'], className)} style={{ height: `calc(100vh - ${searchHeight}px - 64px)` }}>
      <Table 
        ref={ref} 
        {...restProps} 
        pagination={mergedPagination} 
        onChange={handleTableChange}
        scroll={{ ...restProps.scroll, y: restProps.scroll?.y || `calc(100vh - ${searchHeight}px - 100px)` }}
      />
    </div>
  );
});
export default TableCom;
