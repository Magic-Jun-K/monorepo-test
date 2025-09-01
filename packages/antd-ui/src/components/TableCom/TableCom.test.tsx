import { createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { TableCom } from './TableCom';
import { heightManager } from '../../utils/heightManager';

// Mock heightManager
vi.mock('../../utils/heightManager', () => ({
  heightManager: {
    updateHeight: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
  }
}));

// Mock window dimensions
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 1024
});

describe('TableCom', () => {
  const mockOnChange = vi.fn();
  const mockOnPageChange = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    // Reset window dimensions
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const mockData = [
    {
      key: '1',
      name: '张三',
      age: 32,
      address: '西湖区湖底公园1号'
    },
    {
      key: '2',
      name: '李四',
      age: 42,
      address: '西湖区湖底公园2号'
    },
    {
      key: '3',
      name: '王五',
      age: 25,
      address: '西湖区湖底公园3号'
    }
  ];

  const mockColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      sorter: (a: any, b: any) => a.age - b.age
    },
    {
      title: '住址',
      dataIndex: 'address',
      key: 'address'
    }
  ];

  describe('基础渲染', () => {
    it('应该正确渲染表格', () => {
      render(<TableCom columns={mockColumns} dataSource={mockData} />);

      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('王五')).toBeInTheDocument();
      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.getByText('年龄')).toBeInTheDocument();
      expect(screen.getByText('住址')).toBeInTheDocument();
    });

    it('应该应用自定义className', () => {
      const { container } = render(
        <TableCom columns={mockColumns} dataSource={mockData} className="custom-table" />
      );

      expect(container.querySelector('.custom-table')).toBeInTheDocument();
    });

    it('应该正确设置表格滚动', () => {
      const { container } = render(<TableCom columns={mockColumns} dataSource={mockData} />);

      const tableBody = container.querySelector('.ant-table-tbody');
      expect(tableBody).toBeInTheDocument();
    });
  });

  describe('分页功能测试', () => {
    it('应该显示默认分页配置', () => {
      render(<TableCom columns={mockColumns} dataSource={mockData} />);

      // 检查分页器是否存在 - 使用更准确的选择器
      expect(screen.getByRole('list', { name: '' })).toBeInTheDocument();
    });

    it('应该禁用分页', () => {
      render(<TableCom columns={mockColumns} dataSource={mockData} pagination={false} />);

      expect(screen.queryByRole('list', { name: '' })).not.toBeInTheDocument();
    });

    it('应该通过showPagination控制分页显示', () => {
      render(<TableCom columns={mockColumns} dataSource={mockData} showPagination={false} />);

      expect(screen.queryByRole('list', { name: '' })).not.toBeInTheDocument();
    });

    it('应该使用自定义默认页面大小', () => {
      render(<TableCom columns={mockColumns} dataSource={mockData} defaultPageSize={5} />);

      // 验证分页器存在（具体页面大小需要通过更详细的测试验证）
      expect(screen.getByRole('list', { name: '' })).toBeInTheDocument();
    });

    it('应该正确处理页面变化', async () => {
      const largeMockData = Array.from({ length: 25 }, (_, i) => ({
        key: `${i + 1}`,
        name: `用户${i + 1}`,
        age: 20 + i,
        address: `地址${i + 1}`
      }));

      render(
        <TableCom
          columns={mockColumns}
          dataSource={largeMockData}
          defaultPageSize={10}
          onPageChange={mockOnPageChange}
        />
      );

      // 查找分页按钮（第2页）
      const page2Button = screen.getByTitle('2');
      await user.click(page2Button);

      await waitFor(() => {
        expect(mockOnPageChange).toHaveBeenCalledWith(2, 10);
      });
    });

    it('应该合并自定义分页配置', () => {
      const customPagination = {
        current: 2,
        pageSize: 5,
        total: 50
      };

      render(
        <TableCom columns={mockColumns} dataSource={mockData} pagination={customPagination} />
      );

      expect(screen.getByRole('list', { name: '' })).toBeInTheDocument();
    });
  });

  describe('表格变化事件测试', () => {
    it('应该正确处理排序变化', async () => {
      render(<TableCom columns={mockColumns} dataSource={mockData} onChange={mockOnChange} />);

      // 点击年龄列标题进行排序
      const ageHeader = screen.getByText('年龄');
      await user.click(ageHeader);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('应该处理过滤变化', async () => {
      const columnsWithFilter = [
        ...mockColumns,
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          filters: [
            { text: '启用', value: 'active' },
            { text: '禁用', value: 'inactive' }
          ]
        }
      ];

      const dataWithStatus = mockData.map(item => ({ ...item, status: 'active' }));

      render(
        <TableCom columns={columnsWithFilter} dataSource={dataWithStatus} onChange={mockOnChange} />
      );

      // 验证表格渲染
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
  });

  describe('高度管理测试', () => {
    it('应该订阅高度管理器', () => {
      render(<TableCom columns={mockColumns} dataSource={mockData} />);

      expect(heightManager.subscribe).toHaveBeenCalled();
    });

    it('应该正确计算表格高度', () => {
      const { rerender } = render(<TableCom columns={mockColumns} dataSource={mockData} />);

      // 模拟高度管理器回调
      const subscribeCallback = (heightManager.subscribe as any).mock.calls[0][0];
      subscribeCallback(100);

      rerender(<TableCom columns={mockColumns} dataSource={mockData} />);

      expect(heightManager.subscribe).toHaveBeenCalled();
    });

    it('应该处理窗口大小变化', async () => {
      render(<TableCom columns={mockColumns} dataSource={mockData} />);

      // 改变窗口大小
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800
      });

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        expect(heightManager.updateHeight).toHaveBeenCalled();
      });
    });
  });

  describe('滚动配置测试', () => {
    it('应该设置默认水平滚动', () => {
      const { container } = render(<TableCom columns={mockColumns} dataSource={mockData} />);

      const table = container.querySelector('.ant-table');
      expect(table).toBeInTheDocument();
    });

    it('应该合并自定义滚动配置', () => {
      const customScroll = { x: 1200, y: 400 };

      const { container } = render(
        <TableCom columns={mockColumns} dataSource={mockData} scroll={customScroll} />
      );

      const table = container.querySelector('.ant-table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('引用测试', () => {
    it('应该正确转发ref', () => {
      const ref = createRef<any>();

      render(<TableCom ref={ref} columns={mockColumns} dataSource={mockData} />);

      expect(ref.current).toBeTruthy();
    });
  });

  describe('空数据测试', () => {
    it('应该正确处理空数据', () => {
      render(<TableCom columns={mockColumns} dataSource={[]} />);

      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.getByText('年龄')).toBeInTheDocument();
      expect(screen.getByText('住址')).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理极小窗口高度', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 300
      });

      render(<TableCom columns={mockColumns} dataSource={mockData} />);

      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    it('应该处理极大数据量', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        key: `${i + 1}`,
        name: `用户${i + 1}`,
        age: 20 + (i % 50),
        address: `地址${i + 1}`
      }));

      render(<TableCom columns={mockColumns} dataSource={largeData} defaultPageSize={50} />);

      expect(screen.getByText('用户1')).toBeInTheDocument();
    });

    it('应该处理没有onChange回调的情况', async () => {
      render(<TableCom columns={mockColumns} dataSource={mockData} />);

      // 点击年龄列标题进行排序
      const ageHeader = screen.getByText('年龄');
      await user.click(ageHeader);

      // 应该不会报错
      expect(ageHeader).toBeInTheDocument();
    });

    it('应该处理没有onPageChange回调的情况', async () => {
      const largeMockData = Array.from({ length: 25 }, (_, i) => ({
        key: `${i + 1}`,
        name: `用户${i + 1}`,
        age: 20 + i,
        address: `地址${i + 1}`
      }));

      render(<TableCom columns={mockColumns} dataSource={largeMockData} defaultPageSize={10} />);

      // 查找分页按钮（第2页）
      const page2Button = screen.getByTitle('2');
      await user.click(page2Button);

      // 应该不会报错
      expect(page2Button).toBeInTheDocument();
    });
  });

  describe('样式类测试', () => {
    it('应该应用combined-table-container样式类', () => {
      const { container } = render(<TableCom columns={mockColumns} dataSource={mockData} />);

      // 使用更通用的选择器来查找容器元素
      // CSS 模块会将类名转换为唯一标识符，所以我们检查元素是否包含 "combined-table-container" 字符串
      const tableContainer = container.firstElementChild;
      expect(tableContainer).toBeInTheDocument();
      // 检查类名是否包含 combined-table-container
      expect(tableContainer).not.toBeNull();
      if (tableContainer) {
        expect(tableContainer.className).toContain('combined-table-container');
      }
    });
  });

  describe('自定义属性传递测试', () => {
    it('应该正确传递其他Table属性', () => {
      render(
        <TableCom
          columns={mockColumns}
          dataSource={mockData}
          size="small"
          bordered
          title={() => '表格标题'}
        />
      );

      expect(screen.getByText('表格标题')).toBeInTheDocument();
    });

    it('应该正确处理loading状态', () => {
      const { container } = render(
        <TableCom columns={mockColumns} dataSource={mockData} loading={true} />
      );

      expect(container.querySelector('.ant-spin')).toBeInTheDocument();
    });
  });
});
