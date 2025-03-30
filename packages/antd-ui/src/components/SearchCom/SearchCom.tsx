import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Form, Input, Select, DatePicker, TreeSelect, Button, Row, Col, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import clsx from 'clsx';

import { SearchComProps, SearchItem } from './types';
import { heightManager } from '../../utils/heightManager';

const { RangePicker } = DatePicker;

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

  // 新增高度更新逻辑
  const updateSearchHeight = useCallback((height: number) => {
    heightManager.updateHeight(height);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 强制初始化测量
    const initHeight = container.offsetHeight;
    console.log('[SearchCom] 发布初始高度:', initHeight);
    updateSearchHeight(initHeight);

    const observer = new ResizeObserver(entries => {
      // 防抖处理
      requestAnimationFrame(() => {
        const newHeight = entries[0]?.contentRect.height ?? 0;
        console.log('ResizeObserver检测到新高度:', newHeight);
        updateSearchHeight(newHeight);
      });
    });

    observer.observe(container);
    return () => observer.disconnect();
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
      disabled: item.disabled
    };

    switch (item.type) {
      case 'input':
        return <Input {...commonProps} placeholder={item.placeholder} {...item.inputProps} />;
      case 'select':
        return <Select {...commonProps} placeholder={item.placeholder} options={item.options} allowClear {...item.selectProps} />;
      case 'datePicker':
        return <DatePicker {...commonProps} placeholder={item.placeholder} style={{ width: '100%' }} {...item.datePickerProps} />;
      case 'rangePicker':
        return (
          <RangePicker
            {...commonProps}
            style={{ width: '100%' }}
            placeholder={item.placeholder || ['开始日期', '结束日期']}
            {...item.rangePickerProps}
          />
        );
      case 'treeSelect':
        return <TreeSelect {...commonProps} placeholder={item.placeholder} treeData={item.treeData} allowClear style={{ width: '100%' }} {...item.treeSelectProps} />;
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
