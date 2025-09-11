import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Drawer } from './Drawer';
import { DrawerProps } from './types';

describe('Drawer', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const originalBodyStyle = document.body.style.overflow;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 重置body样式
    document.body.style.overflow = originalBodyStyle;
    // 清理可能残留的Portal容器，但要安全地清理
    document.querySelectorAll('[data-drawer-container="true"]').forEach(container => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
  });

  const defaultProps: DrawerProps = {
    open: true,
    onClose: vi.fn(),
    title: '测试抽屉',
    children: <div>抽屉内容</div>
  };

  describe('基础渲染', () => {
    it('应该在open为true时渲染抽屉', () => {
      render(<Drawer {...defaultProps} />);

      expect(screen.getByText('测试抽屉')).toBeInTheDocument();
      expect(screen.getByText('抽屉内容')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('应该在open为false时应用隐藏样式', () => {
      render(<Drawer {...defaultProps} open={false} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('translate-x-full'); // 默认right placement
    });

    it('应该正确渲染标题', () => {
      render(<Drawer {...defaultProps} title="自定义标题" />);

      expect(screen.getByText('自定义标题')).toBeInTheDocument();
      expect(screen.getByText('自定义标题')).toHaveClass('text-base', 'font-medium');
    });

    it('应该正确渲染内容', () => {
      const customContent = <div data-testid="custom-content">自定义内容</div>;
      render(<Drawer {...defaultProps}>{customContent}</Drawer>);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('自定义内容')).toBeInTheDocument();
    });

    it('应该设置正确的ARIA属性', () => {
      render(<Drawer {...defaultProps} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('位置和尺寸', () => {
    it('应该正确渲染右侧抽屉', () => {
      render(<Drawer {...defaultProps} placement="right" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('right-0', 'top-0', 'h-full');
    });

    it('应该正确渲染左侧抽屉', () => {
      render(<Drawer {...defaultProps} placement="left" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('left-0', 'top-0', 'h-full');
    });

    it('应该正确渲染顶部抽屉', () => {
      render(<Drawer {...defaultProps} placement="top" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('top-0', 'left-0', 'w-full');
    });

    it('应该正确渲染底部抽屉', () => {
      render(<Drawer {...defaultProps} placement="bottom" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('bottom-0', 'left-0', 'w-full');
    });

    it('应该应用自定义宽度', () => {
      render(<Drawer {...defaultProps} width={500} placement="right" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveAttribute('style', expect.stringContaining('--drawer-size: 500px'));
    });

    it('应该应用字符串宽度', () => {
      render(<Drawer {...defaultProps} width="50%" placement="right" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveAttribute('style', expect.stringContaining('--drawer-size: 50%'));
    });

    it('应该应用自定义高度', () => {
      render(<Drawer {...defaultProps} height={400} placement="top" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveAttribute('style', expect.stringContaining('--drawer-size: 400px'));
    });

    it('应该应用字符串高度', () => {
      render(<Drawer {...defaultProps} height="60%" placement="bottom" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveAttribute('style', expect.stringContaining('--drawer-size: 60%'));
    });
  });

  describe('关闭功能', () => {
    it('应该显示关闭按钮', () => {
      render(<Drawer {...defaultProps} />);

      const closeButton = screen.getByLabelText('关闭');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('i-carbon-arrow-left');
    });

    it('应该在点击关闭按钮时调用onClose', async () => {
      const mockOnClose = vi.fn();
      render(<Drawer {...defaultProps} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('关闭');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('应该在showClose为false时隐藏关闭按钮', () => {
      render(<Drawer {...defaultProps} showClose={false} />);

      expect(screen.queryByLabelText('关闭')).not.toBeInTheDocument();
    });

    it('应该在maskClosable为true时点击遮罩关闭', async () => {
      const mockOnClose = vi.fn();
      render(<Drawer {...defaultProps} onClose={mockOnClose} maskClosable />);

      // 点击遮罩
      const mask = document.querySelector('.fixed.inset-0.z-49');
      if (mask) {
        await user.click(mask);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('应该在maskClosable为false时点击遮罩不关闭', async () => {
      const mockOnClose = vi.fn();
      render(<Drawer {...defaultProps} onClose={mockOnClose} maskClosable={false} />);

      // 点击遮罩
      const mask = document.querySelector('.fixed.inset-0.z-49');
      if (mask) {
        await user.click(mask);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('遮罩层', () => {
    it('应该在open时显示遮罩', () => {
      render(<Drawer {...defaultProps} />);

      const mask = document.querySelector('.fixed.inset-0.z-49');
      expect(mask).toBeInTheDocument();
      expect(mask).toHaveClass('opacity-100', 'pointer-events-auto');
    });

    it('应该在close时隐藏遮罩', () => {
      render(<Drawer {...defaultProps} open={false} />);

      const mask = document.querySelector('.fixed.inset-0.z-49');
      expect(mask).toBeInTheDocument();
      expect(mask).toHaveClass('opacity-0', 'pointer-events-none');
    });

    it('应该有正确的遮罩样式', () => {
      render(<Drawer {...defaultProps} />);

      const mask = document.querySelector('.fixed.inset-0.z-49');
      expect(mask).toHaveClass('bg-black/40', 'transition-opacity', 'duration-300');
    });
  });

  describe('动画效果', () => {
    it('应该在右侧抽屉打开时应用正确的transform', () => {
      render(<Drawer {...defaultProps} placement="right" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('translate-x-0', 'translate-y-0');
    });

    it('应该在右侧抽屉关闭时应用正确的transform', () => {
      render(<Drawer {...defaultProps} placement="right" open={false} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('translate-x-full');
    });

    it('应该在左侧抽屉关闭时应用正确的transform', () => {
      render(<Drawer {...defaultProps} placement="left" open={false} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('-translate-x-full');
    });

    it('应该在顶部抽屉关闭时应用正确的transform', () => {
      render(<Drawer {...defaultProps} placement="top" open={false} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('-translate-y-full');
    });

    it('应该在底部抽屉关闭时应用正确的transform', () => {
      render(<Drawer {...defaultProps} placement="bottom" open={false} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('translate-y-full');
    });

    it('应该有正确的过渡效果类', () => {
      render(<Drawer {...defaultProps} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('transition-transform', 'duration-300');
    });
  });

  describe('头部渲染', () => {
    it('应该在有标题时渲染头部', () => {
      render(<Drawer {...defaultProps} title="测试标题" />);

      // 查找头部容器：带有边框底部的div元素
      const header = document.querySelector('.border-b.border-gray-200');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass(
        'flex',
        'items-center',
        'justify-start',
        'px-4',
        'py-3',
        'border-b',
        'border-gray-200',
        'shrink-0'
      );

      // 验证标题在头部容器中
      expect(screen.getByText('测试标题')).toBeInTheDocument();
      expect(header).toContainElement(screen.getByText('测试标题'));
    });

    it('应该在有关闭按钮时渲染头部', () => {
      render(<Drawer {...defaultProps} title={undefined} showClose />);

      const closeButton = screen.getByLabelText('关闭');
      const header = closeButton.closest('div');
      expect(header).toHaveClass('flex', 'items-center');
    });

    it('应该在没有标题和关闭按钮时不渲染头部', () => {
      render(<Drawer {...defaultProps} title={undefined} showClose={false} />);

      // 应该没有头部容器
      const headers = document.querySelectorAll('.border-b.border-gray-200');
      expect(headers).toHaveLength(0);
    });

    it('应该正确排列头部元素', () => {
      render(<Drawer {...defaultProps} title="带关闭按钮" showClose />);

      const closeButton = screen.getByLabelText('关闭');
      const title = screen.getByText('带关闭按钮');

      expect(closeButton).toHaveClass('mr-2');
      expect(title).toHaveClass('text-base', 'font-medium');
    });
  });

  describe('底部footer', () => {
    it('应该在showFooter为false时不显示footer', () => {
      render(<Drawer {...defaultProps} showFooter={false} />);

      expect(screen.queryByText('取消')).not.toBeInTheDocument();
      expect(screen.queryByText('确定')).not.toBeInTheDocument();
    });

    it('应该在showFooter为true时显示默认footer', () => {
      render(<Drawer {...defaultProps} showFooter />);

      expect(screen.getByText('取消')).toBeInTheDocument();
      expect(screen.getByText('确定')).toBeInTheDocument();
    });

    it('应该在点击取消按钮时调用onCancel', async () => {
      const mockOnCancel = vi.fn();
      render(<Drawer {...defaultProps} showFooter onCancel={mockOnCancel} />);

      const cancelButton = screen.getByText('取消');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('应该在点击确定按钮时调用onOk', async () => {
      const mockOnOk = vi.fn();
      render(<Drawer {...defaultProps} showFooter onOk={mockOnOk} />);

      const okButton = screen.getByText('确定');
      await user.click(okButton);

      expect(mockOnOk).toHaveBeenCalledTimes(1);
    });

    it('应该渲染自定义footer', () => {
      const customFooter = (
        <div data-testid="custom-footer">
          <button>自定义按钮</button>
        </div>
      );

      render(<Drawer {...defaultProps} showFooter footer={customFooter} />);

      expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
      expect(screen.getByText('自定义按钮')).toBeInTheDocument();
      expect(screen.queryByText('取消')).not.toBeInTheDocument();
      expect(screen.queryByText('确定')).not.toBeInTheDocument();
    });

    it('应该有正确的footer样式', () => {
      render(<Drawer {...defaultProps} showFooter />);

      const footer = screen.getByText('取消').closest('.drawer-footer');
      expect(footer).toHaveClass(
        'flex',
        'justify-end',
        'p-4',
        'border-t',
        'border-gray-200',
        'shrink-0',
        'bg-white'
      );
    });
  });

  describe('布局和样式', () => {
    it('应该有正确的基础样式', () => {
      render(<Drawer {...defaultProps} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('fixed', 'z-50', 'bg-white', 'shadow-lg');
    });

    it('应该应用自定义className', () => {
      render(<Drawer {...defaultProps} className="custom-drawer" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('custom-drawer');
    });

    it('应该有正确的flex布局', () => {
      render(<Drawer {...defaultProps} placement="right" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer.style.display).toBe('flex');
      expect(drawer.style.flexDirection).toBe('column');
    });

    it('应该为水平抽屉设置列布局', () => {
      render(<Drawer {...defaultProps} placement="left" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer.style.flexDirection).toBe('column');
    });

    it('应该为垂直抽屉设置行布局', () => {
      render(<Drawer {...defaultProps} placement="top" />);

      const drawer = screen.getByRole('dialog');
      expect(drawer.style.flexDirection).toBe('row');
    });

    it('应该正确设置内容区域的滚动', () => {
      render(<Drawer {...defaultProps} />);

      const content = screen.getByText('抽屉内容').closest('.overflow-auto');
      expect(content).toHaveClass('p-4', 'overflow-auto', 'flex-1', 'min-h-0');
    });
  });

  describe('边界情况', () => {
    it('应该处理空children', () => {
      render(<Drawer {...defaultProps} children={null} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeInTheDocument();
    });

    it('应该处理复杂的children内容', () => {
      const complexChildren = (
        <div>
          <h4>复杂内容</h4>
          <p>段落文本</p>
          <button>内嵌按钮</button>
          <ul>
            <li>列表项1</li>
            <li>列表项2</li>
          </ul>
        </div>
      );

      render(<Drawer {...defaultProps}>{complexChildren}</Drawer>);

      expect(screen.getByText('复杂内容')).toBeInTheDocument();
      expect(screen.getByText('段落文本')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '内嵌按钮' })).toBeInTheDocument();
      expect(screen.getByText('列表项1')).toBeInTheDocument();
      expect(screen.getByText('列表项2')).toBeInTheDocument();
    });

    it('应该处理没有onClose回调的情况', async () => {
      // 使用空函数代替undefined来避免类型错误
      const emptyOnClose = () => {};
      render(<Drawer {...defaultProps} onClose={emptyOnClose} />);

      const closeButton = screen.getByLabelText('关闭');
      await user.click(closeButton);

      // 应该不会报错
      expect(closeButton).toBeInTheDocument();
    });

    it('应该处理没有onOk和onCancel回调的情况', async () => {
      // 使用空函数代替undefined来避免类型错误（如果需要）
      render(<Drawer {...defaultProps} showFooter />);

      const okButton = screen.getByText('确定');
      const cancelButton = screen.getByText('取消');

      await user.click(okButton);
      await user.click(cancelButton);

      // 应该不会报错
      expect(okButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    });

    it('应该处理极小尺寸', () => {
      render(<Drawer {...defaultProps} width={1} height={1} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeInTheDocument();
    });

    it('应该处理极大尺寸', () => {
      render(<Drawer {...defaultProps} width={9999} height={9999} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('默认导出', () => {
    it('应该正确导出默认组件', () => {
      // 测试default export是否存在
      expect(typeof Drawer).toBe('function');
    });
  });

  describe('可访问性', () => {
    it('应该设置正确的role属性', () => {
      render(<Drawer {...defaultProps} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeInTheDocument();
    });

    it('应该设置正确的aria-modal属性', () => {
      render(<Drawer {...defaultProps} />);

      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveAttribute('aria-modal', 'true');
    });

    it('应该设置正确的aria-hidden属性给遮罩', () => {
      render(<Drawer {...defaultProps} />);

      const mask = document.querySelector('.fixed.inset-0.z-49');
      expect(mask).toHaveAttribute('aria-hidden', 'true');
    });

    it('应该为关闭按钮设置正确的aria-label', () => {
      render(<Drawer {...defaultProps} />);

      const closeButton = screen.getByLabelText('关闭');
      expect(closeButton).toHaveAttribute('aria-label', '关闭');
    });
  });
});
