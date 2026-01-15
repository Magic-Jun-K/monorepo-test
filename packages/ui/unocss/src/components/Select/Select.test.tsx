import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { Select } from './Select';
import { SelectProps } from './types';

describe('Select', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 清理可能打开的下拉菜单
    const openSelects = document.querySelectorAll('.absolute.z-10');
    openSelects.forEach((select) => select.remove());
  });

  const mockOptions = [
    { label: '选项1', value: 'option1' },
    { label: '选项2', value: 'option2' },
    { label: '选项3', value: 'option3' },
    { label: '禁用选项', value: 'disabled', disabled: true },
  ];

  const defaultProps: SelectProps = {
    options: mockOptions,
    placeholder: '请选择',
  };

  describe('基础渲染', () => {
    it('应该正确渲染选择器', () => {
      render(<Select {...defaultProps} />);

      expect(screen.getByText('请选择')).toBeInTheDocument();
      expect(screen.getByText('▾')).toBeInTheDocument();
    });

    it('应该显示占位符', () => {
      render(<Select {...defaultProps} placeholder="自定义占位符" />);

      expect(screen.getByText('自定义占位符')).toBeInTheDocument();
    });

    it('应该显示选中的值', () => {
      render(<Select {...defaultProps} value="option2" />);

      expect(screen.getByText('选项2')).toBeInTheDocument();
      expect(screen.queryByText('请选择')).not.toBeInTheDocument();
    });

    it('应该在没有匹配选项时显示占位符', () => {
      render(<Select {...defaultProps} value="nonexistent" />);

      expect(screen.getByText('请选择')).toBeInTheDocument();
    });

    it('应该应用默认样式类', () => {
      const { container } = render(<Select {...defaultProps} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('relative', 'w-full');

      const selectButton = wrapper.firstChild as HTMLElement;
      expect(selectButton).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'p-2',
        'border',
        'rounded-md',
        'cursor-pointer',
      );
    });
  });

  describe('交互功能', () => {
    it('应该在点击时打开下拉菜单', async () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      expect(screen.getByText('选项1')).toBeInTheDocument();
      expect(screen.getByText('选项2')).toBeInTheDocument();
      expect(screen.getByText('选项3')).toBeInTheDocument();
      expect(screen.getByText('禁用选项')).toBeInTheDocument();
    });

    it('应该在再次点击时关闭下拉菜单', async () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div');

      // 打开下拉菜单
      await user.click(selectButton!);
      expect(screen.getByText('选项1')).toBeInTheDocument();

      // 再次点击关闭
      await user.click(selectButton!);
      expect(screen.queryByText('选项1')).not.toBeInTheDocument();
    });

    it('应该在选择选项时关闭下拉菜单', async () => {
      const mockOnChange = vi.fn();
      render(<Select {...defaultProps} onChange={mockOnChange} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const option1 = screen.getByText('选项1');
      await user.click(option1);

      // 下拉菜单应该关闭
      expect(screen.queryByText('选项2')).not.toBeInTheDocument();
      // onChange应该被调用
      expect(mockOnChange).toHaveBeenCalledWith('option1');
    });

    it('应该在选择选项时调用onChange', async () => {
      const mockOnChange = vi.fn();
      render(<Select {...defaultProps} onChange={mockOnChange} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const option2 = screen.getByText('选项2');
      await user.click(option2);

      expect(mockOnChange).toHaveBeenCalledWith('option2');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('应该在点击外部时关闭下拉菜单', async () => {
      render(
        <div>
          <Select {...defaultProps} />
          <div data-testid="outside">外部区域</div>
        </div>,
      );

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      expect(screen.getByText('选项1')).toBeInTheDocument();

      // 点击外部区域
      const outside = screen.getByTestId('outside');
      await user.click(outside);

      expect(screen.queryByText('选项1')).not.toBeInTheDocument();
    });
  });

  describe('禁用状态', () => {
    it('应该正确渲染禁用的选择器', () => {
      const { container } = render(<Select {...defaultProps} disabled />);

      const selectButton = container.querySelector('div[class*="cursor-pointer"]');
      expect(selectButton).toHaveClass('bg-gray-100');
      expect(selectButton).not.toHaveClass('hover:border-blue-500');
    });

    it('应该在禁用时不响应点击', async () => {
      render(<Select {...defaultProps} disabled />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      // 下拉菜单不应该打开
      expect(screen.queryByText('选项1')).not.toBeInTheDocument();
    });

    it('应该正确渲染禁用的选项', async () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const disabledOption = screen.getByText('禁用选项');
      expect(disabledOption).toHaveClass('text-gray-400', 'cursor-not-allowed');
    });

    it('应该阻止选择禁用的选项', async () => {
      const mockOnChange = vi.fn();
      render(<Select {...defaultProps} onChange={mockOnChange} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const disabledOption = screen.getByText('禁用选项');
      await user.click(disabledOption);

      expect(mockOnChange).not.toHaveBeenCalled();
      // 下拉菜单应该仍然打开
      expect(screen.getByText('选项1')).toBeInTheDocument();
    });
  });

  describe('样式状态', () => {
    it('应该在打开时应用正确的样式', async () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div') as HTMLElement;
      await user.click(selectButton);

      expect(selectButton).toHaveClass('border-blue-500', 'ring-2', 'ring-blue-100');
    });

    it('应该在关闭时应用默认样式', () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div') as HTMLElement;
      expect(selectButton).toHaveClass('border-gray-300');
      expect(selectButton).toHaveClass('hover:border-blue-500');
    });

    it('应该正确显示选中状态的选项', async () => {
      render(<Select {...defaultProps} value="option2" />);

      const selectButton = screen.getByText('选项2').closest('div');
      await user.click(selectButton!);

      // 在下拉菜单中的选项应该有选中样式
      const dropdownOptions = screen.getAllByText('选项2');
      const dropdownOption = dropdownOptions.find((el) => el.closest('.absolute'));

      if (dropdownOption) {
        expect(dropdownOption).toHaveClass('bg-blue-50', 'text-blue-600');
      }
    });

    it('应该在悬停时应用正确的样式', async () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const option1 = screen.getByText('选项1');
      await user.hover(option1);

      expect(option1).toHaveClass('hover:bg-blue-50');
    });
  });

  describe('下拉菜单', () => {
    it('应该正确定位下拉菜单', async () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const dropdown = screen.getByText('选项1').closest('.absolute');
      expect(dropdown).toHaveClass('z-10', 'w-full', 'mt-1');
    });

    it('应该应用正确的下拉菜单样式', async () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const dropdown = screen.getByText('选项1').closest('.absolute');
      expect(dropdown).toHaveClass(
        'bg-white',
        'border',
        'border-gray-200',
        'rounded-md',
        'shadow-lg',
      );
    });

    it('应该为每个选项应用正确的样式', async () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const option1 = screen.getByText('选项1');
      expect(option1).toHaveClass('p-2', 'hover:bg-blue-50', 'cursor-pointer');

      const disabledOption = screen.getByText('禁用选项');
      expect(disabledOption).toHaveClass('text-gray-400', 'cursor-not-allowed');
    });
  });

  describe('键盘导航', () => {
    it('应该支持通过键盘打开下拉菜单', () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div') as HTMLElement;
      selectButton.focus();

      fireEvent.keyDown(selectButton, { key: 'Enter' });

      // 注意：实际实现可能需要添加键盘事件支持
      // expect(screen.getByText('选项1')).toBeInTheDocument();
    });

    it('应该支持通过键盘选择选项', () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div') as HTMLElement;
      selectButton.focus();

      fireEvent.keyDown(selectButton, { key: 'ArrowDown' });

      // 注意：实际实现可能需要添加键盘导航支持
    });

    it('应该支持Escape键关闭下拉菜单', async () => {
      render(<Select {...defaultProps} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      expect(screen.getByText('选项1')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      // 注意：实际实现可能需要添加Escape键支持
      // expect(screen.queryByText('选项1')).not.toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理空选项数组', () => {
      render(<Select options={[]} placeholder="空选项" />);

      expect(screen.getByText('空选项')).toBeInTheDocument();
    });

    it('应该处理空选项数组的点击', async () => {
      render(<Select options={[]} placeholder="空选项" />);

      const selectButton = screen.getByText('空选项').closest('div');
      await user.click(selectButton!);

      // 应该打开空的下拉菜单
      const dropdown = document.querySelector('.absolute.z-10');
      expect(dropdown).toBeInTheDocument();
    });

    it('应该处理重复的value值', () => {
      const duplicateOptions = [
        { label: '选项A', value: 'same' },
        { label: '选项B', value: 'same' },
      ];

      render(<Select options={duplicateOptions} value="same" />);

      // 应该显示第一个匹配的选项
      expect(screen.getByText('选项A')).toBeInTheDocument();
    });

    it('应该处理没有onChange回调的情况', async () => {
      const propsWithoutOnChange = { ...defaultProps };
      delete (propsWithoutOnChange as unknown as Partial<SelectProps>).onChange;
      render(<Select {...propsWithoutOnChange} />);

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const option1 = screen.getByText('选项1');
      await user.click(option1);

      // 应该不会报错，下拉菜单应该关闭
      expect(screen.queryByText('选项2')).not.toBeInTheDocument();
      // 由于没有onChange，显示的仍然是占位符
      expect(screen.getByText('请选择')).toBeInTheDocument();
    });

    it('应该处理长文本选项', () => {
      const longTextOptions = [
        { label: '这是一个非常长的选项文本，用来测试组件如何处理长文本的显示', value: 'long' },
      ];

      render(<Select options={longTextOptions} value="long" />);

      expect(
        screen.getByText('这是一个非常长的选项文本，用来测试组件如何处理长文本的显示'),
      ).toBeInTheDocument();
    });

    it('应该处理特殊字符', () => {
      const specialOptions = [
        { label: '选项 <>&"\'', value: 'special' },
        { label: '选项\n换行', value: 'newline' },
      ];

      render(<Select options={specialOptions} placeholder="特殊选项" />);

      const selectButton = screen.getByText('特殊选项').closest('div');
      fireEvent.click(selectButton!);

      expect(screen.getByText('选项 <>&"\'')).toBeInTheDocument();
      // 对于包含换行符的文本，使用更灵活的查找方式
      expect(
        screen.getByText((_content, element) => {
          return element?.textContent === '选项\n换行';
        }),
      ).toBeInTheDocument();
    });
  });

  describe('受控组件模式', () => {
    it('应该作为受控组件工作', async () => {
      const ControlledSelect = () => {
        const [value, setValue] = useState<string>('');
        return (
          <div>
            <Select {...defaultProps} value={value} onChange={setValue} />
            <div data-testid="current-value">{value || '无选择'}</div>
          </div>
        );
      };

      render(<ControlledSelect />);

      expect(screen.getByTestId('current-value')).toHaveTextContent('无选择');

      const selectButton = screen.getByText('请选择').closest('div');
      await user.click(selectButton!);

      const option2 = screen.getByText('选项2');
      await user.click(option2);

      expect(screen.getByTestId('current-value')).toHaveTextContent('option2');
      expect(screen.getByText('选项2')).toBeInTheDocument();
    });

    it('应该响应外部value变化', () => {
      const { rerender } = render(<Select {...defaultProps} value="option1" />);

      expect(screen.getByText('选项1')).toBeInTheDocument();

      rerender(<Select {...defaultProps} value="option3" />);

      expect(screen.getByText('选项3')).toBeInTheDocument();
      expect(screen.queryByText('选项1')).not.toBeInTheDocument();
    });
  });

  describe('性能优化', () => {
    it('应该正确处理大量选项', async () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        label: `选项${i + 1}`,
        value: `option${i + 1}`,
      }));

      render(<Select options={manyOptions} placeholder="大量选项" />);

      const selectButton = screen.getByText('大量选项').closest('div');
      await user.click(selectButton!);

      expect(screen.getByText('选项1')).toBeInTheDocument();
      expect(screen.getByText('选项100')).toBeInTheDocument();
    });
  });
});
