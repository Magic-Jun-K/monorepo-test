import { forwardRef, useMemo, useEffect, useState } from 'react';
import { Table, PaginationProps } from 'antd';
import type { TableRef } from 'antd/es/table';
import clsx from 'clsx';
import { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';

import { TableComProps } from './types';
import { heightManager } from '../../utils/heightManager';

import styles from './index.module.css';

export const TableCom = forwardRef<TableRef, TableComProps<any>>((props, ref) => {
  const { className, pagination, showPagination = true, defaultPageSize = 10, onChange, onPageChange, ...restProps } = props;
  const [currentHeight, setCurrentHeight] = useState(0);

  // 订阅逻辑
  useEffect(() => {
    const updateHeight = (height: number) => {
      console.log('[TableCom] 收到新高度:', height);
      setCurrentHeight(height);
    };
    heightManager.subscribe(updateHeight);
  }, []);

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

  // 动态计算表格高度
  const tableHeight = useMemo(() => {
    // 安全高度计算（包含以下部分）：
    // 1. 页面顶部导航栏（约 68px）
    // 2. 搜索栏高度（动态的 searchHeight，默认是76px(收起)）
    // 3. 表头高度（55px）
    // 4. 表格分页器高度（约 48px）
    // 5. 安全边距（64px）
    // const safeHeight = `calc(100vh - 68px - 76px - 55px - 48px - 32px )`;
    const baseHeight = 68 + 64 + 55 + 48; // 静态部分总和
    const dynamicHeight = window.innerHeight - baseHeight - currentHeight;
    console.log('[TableCom]最终计算高度:', {
      windowHeight: window.innerHeight,
      baseHeight,
      currentHeight,
      dynamicHeight
    });
    return dynamicHeight > 300 ? dynamicHeight : 300;
  }, [currentHeight]);

  console.log('测试restProps', restProps);

  return (
    <div className={clsx(styles['combined-table-container'], className)}>
      <Table
        ref={ref}
        {...restProps}
        pagination={mergedPagination}
        onChange={handleTableChange}
        scroll={{
          ...restProps.scroll,
          // 调整 y 轴滚动高度计算
          y: restProps.scroll?.y || tableHeight
        }}
      />
    </div>
  );
});
