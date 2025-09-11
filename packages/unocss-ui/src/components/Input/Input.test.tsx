import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { Input } from './Input';

// Mock @iconify/react
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <span data-testid={`icon-${icon}`} className={className}>
      {icon}
    </span>
  )
}));

describe('Input', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染输入框', () => {
      render(<Input placeholder="请输入内容" />);

      const input = screen.getByPlaceholderText('请输入内容');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('应该转发ref到输入框', () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} placeholder="测试ref" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toHaveAttribute('placeholder', '测试ref');
    });

    it('应该应用自定义className到输入框', () => {
      render(<Input className="custom-input" placeholder="自定义样式" />);

      const input = screen.getByPlaceholderText('自定义样式');
      expect(input).toHaveClass('custom-input');
    });

    it('应该有默认的边框样式', () => {
      const { container } = render(<Input placeholder="默认样式" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass(
        'flex',
        'items-center',
        'border',
        'border-gray-300',
        'rounded-md',
        'px-3',
        'py-2'
      );
    });
  });

  describe('状态测试', () => {
    it('应该显示错误状态', () => {
      const { container } = render(<Input status="error" placeholder="错误状态" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('border-red-500');
    });

    it('应该显示警告状态', () => {
      const { container } = render(<Input status="warning" placeholder="警告状态" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('border-yellow-500');
    });

    it('应该在没有状态时使用默认边框', () => {
      const { container } = render(<Input placeholder="默认状态" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('border-gray-300');
    });
  });

  describe('前缀和后缀测试', () => {
    it('应该显示前缀', () => {
      const prefix = <span data-testid="prefix">$</span>;
      render(<Input prefix={prefix} placeholder="带前缀" />);

      expect(screen.getByTestId('prefix')).toBeInTheDocument();
      expect(screen.getByTestId('prefix')).toHaveTextContent('$');
    });

    it('应该显示后缀', () => {
      const suffix = <span data-testid="suffix">%</span>;
      render(<Input suffix={suffix} placeholder="带后缀" />);

      expect(screen.getByTestId('suffix')).toBeInTheDocument();
      expect(screen.getByTestId('suffix')).toHaveTextContent('%');
    });

    it('应该同时显示前缀和后缀', () => {
      const prefix = <span data-testid="prefix">$</span>;
      const suffix = <span data-testid="suffix">%</span>;

      render(<Input prefix={prefix} suffix={suffix} placeholder="前后缀" />);

      expect(screen.getByTestId('prefix')).toBeInTheDocument();
      expect(screen.getByTestId('suffix')).toBeInTheDocument();
    });

    it('应该为前缀应用正确的样式', () => {
      const prefix = <span data-testid="prefix">@</span>;
      render(<Input prefix={prefix} placeholder="前缀样式" />);

      const prefixElement = screen.getByTestId('prefix');
      expect(prefixElement.parentElement).toHaveClass('mr-2', 'text-gray-400');
    });

    it('应该为后缀应用正确的样式', () => {
      const suffix = <span data-testid="suffix">.com</span>;
      render(<Input suffix={suffix} placeholder="后缀样式" />);

      const suffixElement = screen.getByTestId('suffix');
      expect(suffixElement.parentElement).toHaveClass('ml-2', 'text-gray-400');
    });
  });

  describe('清除功能测试', () => {
    it('应该在有内容且allowClear为true时显示清除按钮', async () => {
      render(<Input allowClear placeholder="可清除输入" />);

      const input = screen.getByPlaceholderText('可清除输入');
      await user.type(input, '测试内容');

      expect(screen.getByTestId('icon-carbon:close')).toBeInTheDocument();
    });

    it('应该在内容为空时不显示清除按钮', () => {
      render(<Input allowClear placeholder="空内容" />);

      expect(screen.queryByTestId('icon-carbon:close')).not.toBeInTheDocument();
    });

    it('应该在allowClear为false时不显示清除按钮', async () => {
      render(<Input allowClear={false} placeholder="不可清除" />);

      const input = screen.getByPlaceholderText('不可清除');
      await user.type(input, '测试内容');

      expect(screen.queryByTestId('icon-carbon:close')).not.toBeInTheDocument();
    });

    it('应该在点击清除按钮时清空内容', async () => {
      const mockOnChange = vi.fn();
      render(<Input allowClear onChange={mockOnChange} placeholder="点击清除" />);

      const input = screen.getByPlaceholderText('点击清除');
      await user.type(input, '测试内容');

      const clearButton = screen.getByTestId('icon-carbon:close');
      await user.click(clearButton);

      expect(input).toHaveValue('');
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' })
        })
      );
    });

    it('应该在清除时调用onClear回调', async () => {
      const mockOnClear = vi.fn();
      render(<Input allowClear onClear={mockOnClear} placeholder="清除回调" />);

      const input = screen.getByPlaceholderText('清除回调');
      await user.type(input, '测试内容');

      const clearButton = screen.getByTestId('icon-carbon:close');
      await user.click(clearButton);

      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });

    it('应该为清除按钮应用正确的样式', async () => {
      render(<Input allowClear placeholder="清除样式" />);

      const input = screen.getByPlaceholderText('清除样式');
      await user.type(input, '测试内容');

      const clearButton = screen.getByTestId('icon-carbon:close');
      expect(clearButton.parentElement).toHaveClass(
        'ml-2',
        'text-gray-400',
        'cursor-pointer',
        'hover:text-gray-600',
        'transition-colors'
      );
    });
  });

  describe('值管理测试', () => {
    it('应该显示初始值', () => {
      render(<Input value="初始值" placeholder="值测试" />);

      const input = screen.getByDisplayValue('初始值');
      expect(input).toBeInTheDocument();
    });

    it('应该在用户输入时更新内部状态', async () => {
      render(<Input placeholder="内部状态" />);

      const input = screen.getByPlaceholderText('内部状态');
      await user.type(input, '新内容');

      expect(input).toHaveValue('新内容');
    });

    it('应该在onChange时调用回调', async () => {
      const mockOnChange = vi.fn();
      render(<Input onChange={mockOnChange} placeholder="变化回调" />);

      const input = screen.getByPlaceholderText('变化回调');
      await user.type(input, 'a');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'a' })
        })
      );
    });

    it('应该正确处理受控组件', async () => {
      const ControlledInput = () => {
        const [value, setValue] = useState('');
        return (
          <Input value={value} onChange={e => setValue(e.target.value)} placeholder="受控组件" />
        );
      };

      render(<ControlledInput />);

      const input = screen.getByPlaceholderText('受控组件');
      await user.type(input, '受控内容');

      expect(input).toHaveValue('受控内容');
    });

    it('应该在value属性变化时更新显示', () => {
      const { rerender } = render(<Input value="初始" placeholder="属性变化" />);

      let input = screen.getByDisplayValue('初始');
      expect(input).toHaveValue('初始');

      rerender(<Input value="更新" placeholder="属性变化" />);

      input = screen.getByDisplayValue('更新');
      expect(input).toHaveValue('更新');
    });
  });

  describe('焦点状态测试', () => {
    it('应该在焦点时显示正确的样式', async () => {
      const { container } = render(<Input placeholder="焦点测试" />);

      const input = screen.getByPlaceholderText('焦点测试');
      await user.click(input);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('focus-within:ring-2', 'ring-blue-500', 'transition-colors');
    });

    it('应该能够获得和失去焦点', async () => {
      render(<Input placeholder="焦点变化" />);

      const input = screen.getByPlaceholderText('焦点变化');

      await user.click(input);
      expect(input).toHaveFocus();

      await user.tab();
      expect(input).not.toHaveFocus();
    });
  });

  describe('禁用状态测试', () => {
    it('应该正确处理禁用状态', () => {
      render(<Input disabled placeholder="禁用输入" />);

      const input = screen.getByPlaceholderText('禁用输入');
      expect(input).toBeDisabled();
    });

    it('应该在禁用时阻止用户输入', async () => {
      const mockOnChange = vi.fn();
      render(<Input disabled onChange={mockOnChange} placeholder="禁用输入" />);

      const input = screen.getByPlaceholderText('禁用输入');
      await user.type(input, '尝试输入');

      expect(input).toHaveValue('');
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('键盘事件测试', () => {
    it('应该响应键盘事件', async () => {
      const mockOnKeyDown = vi.fn();
      const mockOnKeyUp = vi.fn();

      render(<Input onKeyDown={mockOnKeyDown} onKeyUp={mockOnKeyUp} placeholder="键盘事件" />);

      const input = screen.getByPlaceholderText('键盘事件');
      await user.type(input, 'a');

      expect(mockOnKeyDown).toHaveBeenCalled();
      expect(mockOnKeyUp).toHaveBeenCalled();
    });

    it('应该响应Enter键', async () => {
      const mockOnKeyDown = vi.fn();
      render(<Input onKeyDown={mockOnKeyDown} placeholder="回车测试" />);

      const input = screen.getByPlaceholderText('回车测试');
      await user.type(input, '{enter}');

      expect(mockOnKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Enter'
        })
      );
    });
  });

  describe('输入类型测试', () => {
    it('应该支持不同的输入类型', () => {
      const { rerender } = render(<Input type="password" placeholder="密码" />);

      let input = screen.getByPlaceholderText('密码');
      expect(input).toHaveAttribute('type', 'password');

      rerender(<Input type="email" placeholder="邮箱" />);

      input = screen.getByPlaceholderText('邮箱');
      expect(input).toHaveAttribute('type', 'email');

      rerender(<Input type="number" placeholder="数字" />);

      input = screen.getByPlaceholderText('数字');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('原生HTML属性测试', () => {
    it('应该传递所有原生HTML输入属性', () => {
      render(
        <Input
          id="test-input"
          name="testName"
          maxLength={10}
          minLength={2}
          required
          autoComplete="off"
          autoFocus
          data-testid="custom-input"
          placeholder="原生属性"
        />
      );

      const input = screen.getByPlaceholderText('原生属性');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'testName');
      expect(input).toHaveAttribute('maxLength', '10');
      expect(input).toHaveAttribute('minLength', '2');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('autoComplete', 'off');
      expect(input).toHaveAttribute('data-testid', 'custom-input');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理null和undefined值', () => {
      const { rerender } = render(<Input value={undefined} placeholder="undefined值" />);

      let input = screen.getByPlaceholderText('undefined值');
      expect(input).toHaveValue('');

      rerender(<Input value={null as any} placeholder="null值" />);

      input = screen.getByPlaceholderText('null值');
      expect(input).toHaveValue('');
    });

    it('应该处理非字符串初始值', () => {
      render(<Input value={123 as any} placeholder="数字值" />);

      const input = screen.getByDisplayValue('123');
      expect(input).toBeInTheDocument();
    });

    it('应该处理空字符串清除', async () => {
      const mockOnClear = vi.fn();
      render(<Input allowClear onClear={mockOnClear} value="" />);

      // 空值时不应该显示清除按钮
      expect(screen.queryByTestId('icon-carbon:close')).not.toBeInTheDocument();
    });

    it('应该处理快速连续的输入变化', async () => {
      const mockOnChange = vi.fn();
      render(<Input onChange={mockOnChange} placeholder="快速输入" />);

      const input = screen.getByPlaceholderText('快速输入');

      // 快速输入多个字符
      await user.type(input, 'abc');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(input).toHaveValue('abc');
    });
  });

  describe('组合事件测试', () => {
    it('应该在清除时同时触发onChange和onClear', async () => {
      const mockOnChange = vi.fn();
      const mockOnClear = vi.fn();

      render(
        <Input allowClear onChange={mockOnChange} onClear={mockOnClear} placeholder="组合事件" />
      );

      const input = screen.getByPlaceholderText('组合事件');
      await user.type(input, '内容');

      const clearButton = screen.getByTestId('icon-carbon:close');
      await user.click(clearButton);

      expect(mockOnClear).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' })
        })
      );
    });
  });

  describe('布局样式测试', () => {
    it('应该在包含前缀、输入框和清除按钮时正确布局', async () => {
      const prefix = <span data-testid="prefix">@</span>;

      render(<Input prefix={prefix} allowClear placeholder="完整布局" />);

      const input = screen.getByPlaceholderText('完整布局');
      await user.type(input, '内容');

      expect(screen.getByTestId('prefix')).toBeInTheDocument();
      expect(input).toHaveClass('flex-1', 'outline-none', 'bg-transparent');
      expect(screen.getByTestId('icon-carbon:close')).toBeInTheDocument();
    });

    it('应该正确处理输入框的flex布局', () => {
      render(<Input placeholder="flex布局" />);

      const input = screen.getByPlaceholderText('flex布局');
      expect(input).toHaveClass('flex-1', 'outline-none', 'bg-transparent');
    });
  });
});
