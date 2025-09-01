import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SearchCom } from './SearchCom';
import { SearchItem } from './types';
import { heightManager } from '../../utils/heightManager';

// Mock heightManager
vi.mock('../../utils/heightManager', () => ({
  heightManager: {
    updateHeight: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
  }
}));

describe('SearchCom', () => {
  const mockOnSearch = vi.fn();
  const mockOnReset = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const basicItems: SearchItem[] = [
    {
      label: '用户名',
      name: 'username',
      type: 'input',
      placeholder: '请输入用户名'
    },
    {
      label: '状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' }
      ]
    }
  ];

  describe('基础渲染', () => {
    it('应该正确渲染搜索组件', () => {
      render(<SearchCom items={basicItems} onSearch={mockOnSearch} />);

      expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
      // Select 组件使用的是 span 元素显示 placeholder
      expect(screen.getByText('请选择状态')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /搜索/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /重置/i })).toBeInTheDocument();
    });

    it('应该使用外部传入的form实例', () => {
      let formInstance: any;
      
      const TestComponent = () => {
        const [form] = Form.useForm();
        formInstance = form;
        return <SearchCom items={basicItems} onSearch={mockOnSearch} form={form} />;
      };
      
      render(<TestComponent />);

      expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
      expect(formInstance).toBeDefined();
    });

    it('应该应用自定义className', () => {
      const { container } = render(
        <SearchCom items={basicItems} onSearch={mockOnSearch} className="custom-search" />
      );

      expect(container.querySelector('.custom-search')).toBeInTheDocument();
    });

    it('应该正确设置初始值', async () => {
      const initialValues = { username: 'testuser', status: 'active' };
      render(
        <SearchCom items={basicItems} onSearch={mockOnSearch} initialValues={initialValues} />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
      });
    });
  });

  describe('搜索项类型测试', () => {
    it('应该正确渲染input类型', () => {
      const items: SearchItem[] = [
        {
          label: '测试输入',
          name: 'test',
          type: 'input',
          placeholder: '测试占位符',
          inputProps: { maxLength: 10 }
        }
      ];

      render(<SearchCom items={items} onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('测试占位符');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('应该正确渲染select类型', () => {
      const items: SearchItem[] = [
        {
          label: '测试选择',
          name: 'test',
          type: 'select',
          placeholder: '请选择',
          options: [
            { label: '选项1', value: '1' },
            { label: '选项2', value: '2' }
          ]
        }
      ];

      render(<SearchCom items={items} onSearch={mockOnSearch} />);

      // Select 组件使用的是 span 元素显示 placeholder
      expect(screen.getByText('请选择')).toBeInTheDocument();
    });

    it('应该正确渲染datePicker类型', () => {
      const items: SearchItem[] = [
        {
          label: '测试日期',
          name: 'date',
          type: 'datePicker',
          placeholder: '请选择日期'
        }
      ];

      render(<SearchCom items={items} onSearch={mockOnSearch} />);

      expect(screen.getByPlaceholderText('请选择日期')).toBeInTheDocument();
    });

    it('应该正确渲染rangePicker类型', () => {
      const items: SearchItem[] = [
        {
          label: '测试日期范围',
          name: 'dateRange',
          type: 'rangePicker',
          placeholder: ['开始时间', '结束时间']
        }
      ];

      render(<SearchCom items={items} onSearch={mockOnSearch} />);

      expect(screen.getByPlaceholderText('开始时间')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('结束时间')).toBeInTheDocument();
    });

    it('应该正确渲染treeSelect类型', () => {
      const items: SearchItem[] = [
        {
          label: '测试树选择',
          name: 'tree',
          type: 'treeSelect',
          placeholder: '请选择节点',
          treeData: [
            { title: '节点1', value: '1', key: '1' },
            { title: '节点2', value: '2', key: '2' }
          ]
        }
      ];

      render(<SearchCom items={items} onSearch={mockOnSearch} />);

      // TreeSelect 组件使用的是 span 元素显示 placeholder
      expect(screen.getByText('请选择节点')).toBeInTheDocument();
    });

    it('应该正确处理带有format属性的datePicker', () => {
      const items: SearchItem[] = [
        {
          label: '测试日期',
          name: 'date',
          type: 'datePicker',
          placeholder: '请选择日期',
          format: 'YYYY-MM-DD'
        }
      ];

      render(<SearchCom items={items} onSearch={mockOnSearch} />);

      expect(screen.getByPlaceholderText('请选择日期')).toBeInTheDocument();
    });

    it('应该正确处理带有format属性的rangePicker', () => {
      const items: SearchItem[] = [
        {
          label: '测试日期范围',
          name: 'dateRange',
          type: 'rangePicker',
          placeholder: ['开始时间', '结束时间'],
          format: 'YYYY-MM-DD'
        }
      ];

      render(<SearchCom items={items} onSearch={mockOnSearch} />);

      expect(screen.getByPlaceholderText('开始时间')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('结束时间')).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该正确处理搜索事件', async () => {
      render(<SearchCom items={basicItems} onSearch={mockOnSearch} />);

      const usernameInput = screen.getByPlaceholderText('请输入用户名');
      await user.type(usernameInput, 'testuser');

      const searchButton = screen.getByRole('button', { name: /搜索/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith({
          username: 'testuser',
          status: undefined
        });
      });
    });

    it('应该正确处理重置事件', async () => {
      render(<SearchCom items={basicItems} onSearch={mockOnSearch} onReset={mockOnReset} />);

      const usernameInput = screen.getByPlaceholderText('请输入用户名');
      await user.type(usernameInput, 'testuser');

      const resetButton = screen.getByRole('button', { name: /重置/i });
      await user.click(resetButton);

      // 验证不会调用onSearch
      expect(mockOnSearch).not.toHaveBeenCalled();
      // 验证调用了onReset
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('UI配置测试', () => {
    it('应该隐藏重置按钮', () => {
      render(<SearchCom items={basicItems} onSearch={mockOnSearch} showResetButton={false} />);

      expect(screen.queryByRole('button', { name: /重置/i })).not.toBeInTheDocument();
    });

    it('应该隐藏搜索按钮', () => {
      render(<SearchCom items={basicItems} onSearch={mockOnSearch} showSearchButton={false} />);

      expect(screen.queryByRole('button', { name: /搜索/i })).not.toBeInTheDocument();
    });

    it('应该显示自定义按钮文本', () => {
      render(
        <SearchCom
          items={basicItems}
          onSearch={mockOnSearch}
          searchButtonText="查询"
          resetButtonText="清空"
        />
      );

      expect(screen.getByRole('button', { name: /查询/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /清空/i })).toBeInTheDocument();
    });

    it('应该显示加载状态', () => {
      render(<SearchCom items={basicItems} onSearch={mockOnSearch} searchLoading={true} />);

      const searchButton = screen.getByRole('button', { name: /搜索/i });
      expect(searchButton).toHaveClass('ant-btn-loading');
    });

    it('应该显示重置加载状态', () => {
      render(<SearchCom items={basicItems} onSearch={mockOnSearch} resetLoading={true} />);

      const resetButton = screen.getByRole('button', { name: /重置/i });
      expect(resetButton).toHaveClass('ant-btn-loading');
    });
  });

  describe('禁用状态测试', () => {
    it('应该正确处理禁用的搜索项', () => {
      const disabledItems: SearchItem[] = [
        {
          label: '禁用输入',
          name: 'disabled',
          type: 'input',
          placeholder: '禁用状态',
          disabled: true
        }
      ];

      render(<SearchCom items={disabledItems} onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('禁用状态');
      expect(input).toBeDisabled();
    });

    it('应该隐藏hidden的搜索项', () => {
      const hiddenItems: SearchItem[] = [
        {
          label: '隐藏输入',
          name: 'hidden',
          type: 'input',
          placeholder: '隐藏状态',
          hidden: true
        }
      ];

      render(<SearchCom items={hiddenItems} onSearch={mockOnSearch} />);

      expect(screen.queryByPlaceholderText('隐藏状态')).not.toBeInTheDocument();
    });
  });

  describe('布局配置测试', () => {
    it('应该使用自定义列配置', () => {
      const customColConfig = { xs: 12, sm: 8, md: 6, lg: 4, xl: 3, xxl: 3 };

      render(<SearchCom items={basicItems} onSearch={mockOnSearch} colConfig={customColConfig} />);

      // 验证组件能正常渲染（布局配置主要影响样式）
      expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
    });

    it('应该使用自定义行间距', () => {
      const customRowGutter: [number, number] = [16, 16];

      render(<SearchCom items={basicItems} onSearch={mockOnSearch} rowGutter={customRowGutter} />);

      expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
    });
  });

  describe('表单验证测试', () => {
    it('应该处理必填项验证', async () => {
      const requiredItems: SearchItem[] = [
        {
          label: '必填项',
          name: 'required',
          type: 'input',
          placeholder: '必填输入',
          required: true,
          rules: [{ required: true, message: '请输入必填项' }]
        }
      ];

      render(<SearchCom items={requiredItems} onSearch={mockOnSearch} />);

      const searchButton = screen.getByRole('button', { name: /搜索/i });
      // 点击搜索按钮，这会触发表单验证
      await user.click(searchButton);

      // 等待一段时间让验证完成
      await waitFor(() => {
        // 验证不会调用onSearch（因为验证失败）
        expect(mockOnSearch).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('应该处理自定义验证规则', async () => {
      const customRuleItems: SearchItem[] = [
        {
          label: '自定义规则',
          name: 'custom',
          type: 'input',
          placeholder: '最少3个字符',
          rules: [{ min: 3, message: '最少输入3个字符' }]
        }
      ];

      render(<SearchCom items={customRuleItems} onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('最少3个字符');
      await user.type(input, 'ab');

      const searchButton = screen.getByRole('button', { name: /搜索/i });
      // 点击搜索按钮，这会触发表单验证
      await user.click(searchButton);

      // 等待一段时间让验证完成
      await waitFor(() => {
        // 验证不会调用onSearch（因为验证失败）
        expect(mockOnSearch).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });

  describe('高度管理测试', () => {
    it('应该在组件挂载时更新高度', () => {
      render(<SearchCom items={basicItems} onSearch={mockOnSearch} />);

      expect(heightManager.updateHeight).toHaveBeenCalled();
    });

    it('应该在展开状态变化时更新高度', async () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        label: `字段${i}`,
        name: `field${i}`,
        type: 'input' as const,
        placeholder: `请输入字段${i}`
      }));

      render(<SearchCom items={manyItems} onSearch={mockOnSearch} />);

      const initialCallCount = (heightManager.updateHeight as any).mock.calls.length;

      const toggleButton = screen.getByRole('button', { name: /收起/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(heightManager.updateHeight).toHaveBeenCalledTimes(initialCallCount + 1);
      });
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的搜索项数组', () => {
      render(<SearchCom items={[]} onSearch={mockOnSearch} />);

      expect(screen.getByRole('button', { name: /搜索/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /重置/i })).toBeInTheDocument();
    });

    it('应该处理没有onSearch回调的情况', async () => {
      render(<SearchCom items={basicItems} />);

      const searchButton = screen.getByRole('button', { name: /搜索/i });
      await user.click(searchButton);

      // 应该不会报错
      expect(searchButton).toBeInTheDocument();
    });

    it('应该处理没有onReset回调的情况', async () => {
      render(<SearchCom items={basicItems} onSearch={mockOnSearch} />);

      const resetButton = screen.getByRole('button', { name: /重置/i });
      await user.click(resetButton);

      // 应该不会报错
      expect(resetButton).toBeInTheDocument();
    });
  });
});
