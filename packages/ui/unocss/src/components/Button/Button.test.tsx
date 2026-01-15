import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { Button } from './Button';

const IconComponent = () => <span data-testid="test-icon">🎯</span>;

describe('Button', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('基础渲染', () => {
    it('应该正确渲染按钮', () => {
      render(<Button>测试按钮</Button>);

      const button = screen.getByRole('button', { name: '测试按钮' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('测试按钮');
    });

    it('应该有默认的button类型', () => {
      render(<Button>默认按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('应该应用自定义className', () => {
      render(<Button className="custom-class">自定义样式</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('应该转发ref', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Button ref={ref}>引用按钮</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toHaveTextContent('引用按钮');
    });
  });

  describe('类型(type)测试', () => {
    it('应该渲染primary类型按钮', () => {
      render(<Button type="primary">主要按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-500', 'hover:bg-blue-600', 'text-white');
    });

    it('应该渲染default类型按钮', () => {
      render(<Button type="default">默认按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200', 'hover:bg-gray-300', 'text-gray-800');
    });

    it('应该渲染dashed类型按钮', () => {
      render(<Button type="dashed">虚线按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-gray-300', 'hover:border-blue-500');
    });

    it('应该渲染text类型按钮', () => {
      render(<Button type="text">文本按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-gray-100');
    });

    it('应该渲染link类型按钮', () => {
      render(<Button type="link">链接按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-blue-500', 'hover:text-blue-600');
    });
  });

  describe('尺寸(size)测试', () => {
    it('应该渲染小尺寸按钮', () => {
      render(<Button size="sm">小按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'px-3', 'text-sm');
    });

    it('应该渲染中等尺寸按钮', () => {
      render(<Button size="md">中等按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-4');
    });

    it('应该渲染大尺寸按钮', () => {
      render(<Button size="lg">大按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-6', 'text-lg');
    });

    it('应该默认为中等尺寸', () => {
      render(<Button>默认尺寸</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-4');
    });
  });

  describe('颜色(color)和变体(variant)测试', () => {
    it('应该渲染primary填充变体', () => {
      render(
        <Button color="primary" variant="filled">
          主要填充
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-500', 'hover:bg-blue-600', 'text-white');
    });

    it('应该渲染success填充变体', () => {
      render(
        <Button color="success" variant="filled">
          成功填充
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-500', 'hover:bg-green-600', 'text-white');
    });

    it('应该渲染warning填充变体', () => {
      render(
        <Button color="warning" variant="filled">
          警告填充
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-yellow-500', 'hover:bg-yellow-600', 'text-white');
    });

    it('应该渲染danger填充变体', () => {
      render(
        <Button color="danger" variant="filled">
          危险填充
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500', 'hover:bg-red-600', 'text-white');
    });

    it('应该渲染primary轮廓变体', () => {
      render(
        <Button color="primary" variant="outlined">
          主要轮廓
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-blue-500', 'text-blue-500', 'hover:bg-blue-50');
    });

    it('应该渲染success轮廓变体', () => {
      render(
        <Button color="success" variant="outlined">
          成功轮廓
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'border',
        'border-green-500',
        'text-green-500',
        'hover:bg-green-50',
      );
    });

    it('应该渲染primary文本变体', () => {
      render(
        <Button color="primary" variant="text">
          主要文本
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-blue-500', 'hover:bg-blue-50');
    });

    it('应该渲染success文本变体', () => {
      render(
        <Button color="success" variant="text">
          成功文本
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-green-500', 'hover:bg-green-50');
    });
  });

  describe('危险状态(danger)测试', () => {
    it('应该渲染危险的primary按钮', () => {
      render(
        <Button type="primary" danger>
          危险按钮
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500', 'hover:bg-red-600', 'text-white');
    });

    it('应该渲染危险颜色', () => {
      render(<Button color="danger">危险颜色</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500', 'hover:bg-red-600', 'text-white');
    });
  });

  describe('图标支持测试', () => {
    it('应该渲染带图标的按钮', () => {
      render(<Button icon={<IconComponent />}>带图标按钮</Button>);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('带图标按钮')).toBeInTheDocument();
    });

    it('应该在图标和文本之间添加正确的间距', () => {
      render(<Button icon={<IconComponent />}>带图标按钮</Button>);

      const icon = screen.getByTestId('test-icon');
      expect(icon.parentElement).toHaveClass('mr-2');
    });

    it('应该支持仅图标按钮', () => {
      render(<Button icon={<IconComponent />} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('加载状态测试', () => {
    it('应该显示加载状态', () => {
      render(<Button loading>加载按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-70', 'cursor-not-allowed');
      expect(button).toBeDisabled();
    });

    it('应该在加载时显示加载图标', () => {
      render(<Button loading>加载按钮</Button>);

      const button = screen.getByRole('button');
      const loadingSpinner = button.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
      expect(loadingSpinner).toHaveClass(
        'border-t-2',
        'border-r-2',
        'border-current',
        'rounded-full',
      );
    });

    it('应该在加载时隐藏普通图标', () => {
      render(
        <Button loading icon={<IconComponent />}>
          加载中
        </Button>,
      );

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
      expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('应该在加载时禁用按钮', () => {
      const mockClick = vi.fn();

      render(
        <Button loading onClick={mockClick}>
          加载按钮
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('HTML类型测试', () => {
    it('应该设置submit类型', () => {
      render(<Button htmlType="submit">提交按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('应该设置reset类型', () => {
      render(<Button htmlType="reset">重置按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('应该默认为button类型', () => {
      render(<Button>默认按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('事件处理测试', () => {
    it('应该响应点击事件', async () => {
      const mockClick = vi.fn();

      render(<Button onClick={mockClick}>点击按钮</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('应该传递事件对象', () => {
      const mockClick = vi.fn();

      render(<Button onClick={mockClick}>点击按钮</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('应该支持其他事件处理器', async () => {
      const mockMouseEnter = vi.fn();
      const mockMouseLeave = vi.fn();

      render(
        <Button onMouseEnter={mockMouseEnter} onMouseLeave={mockMouseLeave}>
          悬停按钮
        </Button>,
      );

      const button = screen.getByRole('button');
      await user.hover(button);
      expect(mockMouseEnter).toHaveBeenCalledTimes(1);

      await user.unhover(button);
      expect(mockMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe('禁用状态测试', () => {
    it('应该渲染禁用按钮', () => {
      render(<Button disabled>禁用按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('应该在禁用时不响应点击', async () => {
      const mockClick = vi.fn();

      render(
        <Button disabled onClick={mockClick}>
          禁用按钮
        </Button>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockClick).not.toHaveBeenCalled();
    });

    it('应该在加载时自动禁用', () => {
      render(<Button loading>加载按钮</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('样式组合测试', () => {
    it('应该正确组合多个样式类', () => {
      render(
        <Button type="primary" size="lg" className="custom-class">
          组合样式
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded',
        'font-medium',
        'transition-colors',
        'bg-blue-500',
        'hover:bg-blue-600',
        'text-white',
        'h-10',
        'px-6',
        'text-lg',
        'custom-class',
      );
    });

    it('应该优先使用color和variant而不是type', () => {
      render(
        <Button type="primary" color="success" variant="outlined">
          优先级测试
        </Button>,
      );

      const button = screen.getByRole('button');
      // 应该使用 success + outlined 的样式，而不是 primary 的样式
      expect(button).toHaveClass(
        'border',
        'border-green-500',
        'text-green-500',
        'hover:bg-green-50',
      );
      expect(button).not.toHaveClass('bg-blue-500');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空children', () => {
      render(<Button />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeEmptyDOMElement();
    });

    it('应该处理复杂的children内容', () => {
      render(
        <Button>
          <span>复杂</span>
          <strong>内容</strong>
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('复杂内容');
      expect(button.querySelector('span')).toBeInTheDocument();
      expect(button.querySelector('strong')).toBeInTheDocument();
    });

    it('应该传递所有原生HTML按钮属性', () => {
      render(
        <Button id="test-button" data-testid="custom-test-id" aria-label="自定义标签" tabIndex={-1}>
          原生属性
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'test-button');
      expect(button).toHaveAttribute('data-testid', 'custom-test-id');
      expect(button).toHaveAttribute('aria-label', '自定义标签');
      expect(button).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('样式覆盖测试', () => {
    it('应该允许通过className覆盖默认样式', () => {
      render(<Button className="!bg-purple-500">覆盖样式</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('!bg-purple-500');
    });
  });
});
