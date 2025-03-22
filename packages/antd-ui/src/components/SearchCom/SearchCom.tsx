import React, { useEffect, useState, useRef } from 'react';
import { useLayoutContext } from '../../context/LayoutContext';
import { Form, Input, Select, DatePicker, TreeSelect, Button, Row, Col, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import clsx from 'clsx';

import { SearchItem } from './types';

const { RangePicker } = DatePicker;

// 组件属性定义
export interface SearchComProps {
  items: SearchItem[];
  initialValues?: Record<string, any>;
  onSearch?: (values: Record<string, any>) => void;
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

export const SearchCom: React.FC<SearchComProps> = ({
  items,
  initialValues = {},
  onSearch,
  onReset,
  form: externalForm,
  className,
  showResetButton = true,
  showSearchButton = true,
  searchButtonText = '搜索',
  resetButtonText = '重置',
  searchLoading = false,
  resetLoading = false,
  colConfig = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 6 },
  rowGutter = [8, 8]
}) => {
  // 使用外部传入的form或创建内部form
  const [form] = Form.useForm(externalForm);
  // 控制展开/收起状态
  const [expanded, setExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateSearchHeight } = useLayoutContext();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 立即更新初始高度
    const initialHeight = container.clientHeight;
    console.log('初始化SearchCom高度:', initialHeight);
    updateSearchHeight(initialHeight);

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        console.log('ResizeObserver检测到高度变化:', height);
        updateSearchHeight(height);
      }
    });

    observer.observe(container);

    // 添加延迟重新观察确保初始测量
    setTimeout(() => {
      observer.disconnect();
      observer.observe(container);
      updateSearchHeight(container.clientHeight);
    }, 50);

    return () => {
      observer.disconnect();
    };
  }, [updateSearchHeight]);

  // 初始化表单值
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  // 展开状态变化时更新高度
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const height = container.clientHeight;
      console.log('展开/收起状态变化，新高度:', height, '展开状态:', expanded);
      updateSearchHeight(height);
    }
  }, [expanded, updateSearchHeight]);

  // 切换展开/收起状态
  const toggleExpand = () => {
    console.log('切换展开/收起状态，当前状态:', expanded);
    setExpanded(!expanded);
  };

  // 处理搜索事件
  const handleSearch = () => {
    form.validateFields().then(values => {
      onSearch?.(values);
    });
  };

  // 处理重置事件
  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  // 渲染搜索项
  const renderSearchItem = (item: SearchItem) => {
    if (item.hidden) return null;

    const commonProps = {
      placeholder: item.type === 'rangePicker' && Array.isArray(item.placeholder) ? item.placeholder : item.placeholder,
      disabled: item.disabled
    };

    switch (item.type) {
      case 'input':
        return <Input {...commonProps} {...item.inputProps} />;
      case 'select':
        return <Select {...commonProps} options={item.options} allowClear {...item.selectProps} />;
      case 'datePicker':
        return <DatePicker {...commonProps} style={{ width: '100%' }} {...item.datePickerProps} />;
      case 'rangePicker':
        return <RangePicker {...commonProps} placeholder={['开始日期', '结束日期']} style={{ width: '100%' }} {...item.rangePickerProps} />;
      case 'treeSelect':
        return <TreeSelect {...commonProps} treeData={item.treeData} allowClear style={{ width: '100%' }} {...item.treeSelectProps} />;
      default:
        return null;
    }
  };

  return (
    <div className={clsx('search-form-container', className)} style={{ position: 'relative' }} ref={containerRef}>
      <Form form={form} layout="vertical">
        <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '76px' }}>
          {/* 左侧搜索表单项区域 */}
          <div style={{ flex: '1 1 auto', marginRight: '200px' }}>
            <Row gutter={rowGutter}>
              {items
                .filter((item, index) => {
                  // 展开状态显示所有项，收起状态只显示第一行
                  if (expanded) return true;

                  // 计算每行能显示的项数
                  const itemsPerRow = 24 / (colConfig.xl || 6);
                  // 只显示第一行的项
                  return index < itemsPerRow;
                })
                .map((item, index) => (
                  <Col key={item.name || index} {...colConfig} span={item.colSpan}>
                    <Form.Item
                      // label={item.label}
                      name={item.name}
                      rules={item.rules}
                      required={item.required}
                    >
                      {renderSearchItem(item)}
                    </Form.Item>
                  </Col>
                ))}
            </Row>
          </div>

          {/* 右侧固定按钮区域 */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              gap: '8px'
            }}
          >
            <Space>
              {showSearchButton && (
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={searchLoading}
                  style={{ background: '#1677ff', fontSize: '1rem' }}
                >
                  {searchButtonText}
                </Button>
              )}
              {showResetButton && (
                <Button icon={<ReloadOutlined />} onClick={handleReset} loading={resetLoading} style={{ fontSize: '1rem' }}>
                  {resetButtonText}
                </Button>
              )}
            </Space>

            {/* 展开/收起按钮 */}
            <Button type="link" onClick={toggleExpand} icon={expanded ? <UpOutlined /> : <DownOutlined />} style={{ fontSize: '1rem' }}>
              {expanded ? '收起' : '展开'}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
