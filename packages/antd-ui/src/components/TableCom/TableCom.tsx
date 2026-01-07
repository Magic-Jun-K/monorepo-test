import { forwardRef, useMemo, useEffect, useState } from 'react';
import { Table, PaginationProps } from 'antd';
import type { TableRef } from 'antd/es/table';
import clsx from 'clsx';
import { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';

import { TableComProps } from './types';
import { heightManager } from '../../utils/heightManager';

import styles from './index.module.css';

export const TableCom = forwardRef<TableRef, TableComProps<unknown>>((props, ref) => {
  const {
    className,
    pagination,
    showPagination = true,
    defaultPageSize = 10,
    onChange,
    onPageChange,
    ...restProps
  } = props;
  const [currentHeight, setCurrentHeight] = useState(0);

  // 订阅逻辑
  useEffect(() => {
    const updateHeight = (height: number) => {
      // console.log('[TableCom] 收到新高度:', height);
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
      },
    };
  }, [pagination, showPagination, defaultPageSize, onPageChange]);

  // 处理表格变化事件
  const handleTableChange = (
    pagination: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<unknown> | SorterResult<unknown>[],
    extra: TableCurrentDataSource<unknown>,
  ) => {
    onChange?.(pagination, filters, sorter, extra);
  };

  // 动态计算表格高度
  const tableHeight = useMemo(() => {
    // 计算表格内容区域的最大高度（scroll.y）
    // 总可用高度 = 窗口高度 - 顶部导航 - 搜索栏 - 按钮区域 - 容器padding - 安全边距
    // 然后减去表头高度和分页器高度，得到表格内容区域的高度
    const buttonAreaHeight = 60; // 按钮区域高度（包含padding-bottom）
    // 计算可用高度
    // 可用高度 = 窗口高度(window.innerHeight) - 顶部导航(68) - 搜索栏(currentHeight) - 按钮区域(buttonAreaHeight) - 容器padding(32) - 安全边距(32)
    const availableHeight =
      globalThis.window.innerHeight - 68 - currentHeight - buttonAreaHeight - 32 - 32; // 减去导航、搜索、按钮、padding、边距
    // 计算内容高度
    // 内容高度 = 可用高度 - 表头高度(55) - 分页器高度(64)
    const contentHeight = availableHeight - 55 - 64; // 减去表头和分页器高度
    // console.log('[TableCom]最终计算高度:', {
    //   windowHeight: window.innerHeight,
    //   currentHeight,
    //   buttonAreaHeight,
    //   availableHeight,
    //   contentHeight
    // });
    return Math.max(contentHeight, 200); // 确保最小内容高度为200px
  }, [currentHeight]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      // 触发重新计算高度
      const buttonAreaHeight = 60; // 按钮区域高度（包含padding-bottom）
      // 计算新的可用高度
      const availableHeight =
        globalThis.window.innerHeight - 68 - currentHeight - buttonAreaHeight - 32 - 32;
      const contentHeight = availableHeight - 55 - 64;
      // console.log('[TableCom]窗口大小变化，重新计算高度:', contentHeight);
      // 发布新高度
      heightManager.updateHeight(contentHeight);
    };

    globalThis.window.addEventListener('resize', handleResize);
    return () => globalThis.window.removeEventListener('resize', handleResize);
  }, [currentHeight]);

  // console.log('测试restProps', restProps);

  return (
    <div className={clsx(styles['combined-table-container'], className)}>
      <Table
        ref={ref}
        {...restProps}
        pagination={mergedPagination}
        onChange={handleTableChange}
        scroll={{
          ...restProps.scroll,
          x: restProps.scroll?.x || 'max-content',
          y: tableHeight,
        }}
      />
    </div>
  );
});
