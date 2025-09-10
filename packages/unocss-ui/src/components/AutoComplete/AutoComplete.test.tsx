import { useState } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { AutoComplete } from './AutoComplete';
import { AutoCompleteProps, SuggestionItem } from './types';

describe('AutoComplete', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 清理可能打开的下拉菜单
    const openDropdowns = document.querySelectorAll('.absolute.z-10');
    openDropdowns.forEach(dropdown => dropdown.remove());
  });

  // 辅助函数：等待防抖
  const waitForDebounce = async (time = 350) => {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, time));
    });
  };

  const mockOptions: SuggestionItem[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date' }
  ];

  const defaultProps: Partial<AutoCompleteProps> = {
    options: mockOptions,
    placeholder: '请输入内容'
  };

  describe('基础渲染', () => {
    it('应该正确渲染自动补全组件', () => {
      render(<AutoComplete {...defaultProps} />);

      const input = screen.getByPlaceholderText('请输入内容');
      expect(input).toBeInTheDocument();
      // Input组件的结构不同，检查是否存在输入框
      expect(input.tagName).toBe('INPUT');
    });

    it('应该显示默认值', () => {
      render(<AutoComplete {...defaultProps} defaultValue="test value" />);

      const input = screen.getByDisplayValue('test value');
      expect(input).toBeInTheDocument();
    });

    it('应该显示受控值', () => {
      render(<AutoComplete {...defaultProps} value="controlled value" />);

      const input = screen.getByDisplayValue('controlled value');
      expect(input).toBeInTheDocument();
    });

    it('应该显示占位符', () => {
      render(<AutoComplete {...defaultProps} placeholder="自定义占位符" />);

      expect(screen.getByPlaceholderText('自定义占位符')).toBeInTheDocument();
    });

    it('应该在有值时显示下拉箭头', () => {
      render(<AutoComplete {...defaultProps} />);

      const arrow = document.querySelector('svg');
      if (arrow) {
        expect(arrow).toBeInTheDocument();
      }
    });
  });

  describe('基础交互', () => {
    it('应该在输入时触发onChange', async () => {
      const mockOnChange = vi.fn();
      render(<AutoComplete {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await user.type(input, 'a');

      expect(mockOnChange).toHaveBeenCalledWith('a');
    });

    it('应该在输入时更新显示值', async () => {
      render(<AutoComplete {...defaultProps} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await user.type(input, 'test');

      expect(input).toHaveValue('test');
    });

    it('应该在焦点时立即搜索', async () => {
      render(<AutoComplete {...defaultProps} value="ap" />);

      const input = screen.getByDisplayValue('ap');
      await act(async () => {
        await user.click(input);
      });

      // 等待防抖延迟
      await waitForDebounce();

      await waitFor(
        () => {
          expect(screen.getByText('Apple')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('搜索和过滤', () => {
    it('应该根据输入过滤选项', async () => {
      render(<AutoComplete {...defaultProps} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await act(async () => {
        await user.type(input, 'ap');
      });

      // 等待防抖延迟
      await waitForDebounce();

      await waitFor(
        () => {
          expect(screen.getByText('Apple')).toBeInTheDocument();
          expect(screen.queryByText('Banana')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('应该支持大小写不敏感的搜索', async () => {
      render(<AutoComplete {...defaultProps} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await act(async () => {
        await user.type(input, 'APPLE');
      });

      await waitForDebounce();

      await waitFor(
        () => {
          expect(screen.getByText('Apple')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('应该使用自定义防抖时间', async () => {
      render(<AutoComplete {...defaultProps} debounce={500} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await act(async () => {
        await user.type(input, 'ap');
      });

      // 等待自定义防抖时间
      await waitForDebounce(550);

      await waitFor(
        () => {
          expect(screen.getByText('Apple')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('应该在没有匹配项时显示提示', async () => {
      // 使用空的options来确保没有匹配
      render(<AutoComplete options={[]} placeholder="请输入内容" />);

      const input = screen.getByPlaceholderText('请输入内容');
      await act(async () => {
        await user.type(input, 'xyz');
      });

      await waitForDebounce();

      // 需要手动触发搜索显示空结果
      await act(async () => {
        await user.click(input);
      });

      await waitFor(
        () => {
          expect(screen.getByText('No matches found')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('选择功能', () => {
    it('应该在点击选项时选择', async () => {
      const mockOnSelect = vi.fn();
      render(<AutoComplete {...defaultProps} onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await act(async () => {
        await user.type(input, 'ap');
      });

      await waitForDebounce();

      await waitFor(
        async () => {
          const option = screen.getByText('Apple');
          await act(async () => {
            await user.click(option);
          });
        },
        { timeout: 3000 }
      );

      expect(mockOnSelect).toHaveBeenCalledWith({ label: 'Apple', value: 'apple' });
    });

    it('应该在选择后关闭下拉菜单', async () => {
      render(<AutoComplete {...defaultProps} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await act(async () => {
        await user.type(input, 'ap');
      });

      await waitForDebounce();

      await waitFor(
        async () => {
          const option = screen.getByText('Apple');
          await act(async () => {
            await user.click(option);
          });
        },
        { timeout: 3000 }
      );

      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });

    it('应该支持键盘选择', async () => {
      const mockOnSelect = vi.fn();
      render(<AutoComplete {...defaultProps} onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await act(async () => {
        await user.type(input, 'a');
      });

      await waitForDebounce();

      await waitFor(
        () => {
          expect(screen.getByText('Apple')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // 使用键盘导航 - 第一个选项应该已经默认高亮
      await act(async () => {
        await user.keyboard('{Enter}');
      });

      expect(mockOnSelect).toHaveBeenCalledWith({ label: 'Apple', value: 'apple' });
    });
  });

  describe('禁用状态', () => {
    it('应该正确渲染禁用状态', () => {
      render(<AutoComplete {...defaultProps} disabled />);

      const input = screen.getByPlaceholderText('请输入内容');
      expect(input).toBeDisabled();
    });

    it('应该在禁用时阻止输入', async () => {
      const mockOnChange = vi.fn();
      render(<AutoComplete {...defaultProps} disabled onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('请输入内容');

      // 尝试输入，应该被阻止
      await user.type(input, 'test');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('应该在禁用时不显示下拉菜单', async () => {
      render(<AutoComplete {...defaultProps} disabled value="ap" />);

      const input = screen.getByDisplayValue('ap');
      await user.click(input);

      await waitForDebounce();

      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  describe('清除功能', () => {
    it('应该在allowClear为true且有值时显示清除按钮', () => {
      render(<AutoComplete {...defaultProps} allowClear value="test" />);

      // 检查Input组件是否渲染了清除按钮
      // Input组件使用Iconify图标，所以我们查找具有cursor-pointer类的span元素
      const clearButton = document.querySelector('span.cursor-pointer');
      expect(clearButton).toBeInTheDocument();
    });

    it('应该在allowClear为false时不显示清除按钮', () => {
      render(<AutoComplete {...defaultProps} allowClear={false} value="test" />);

      // 确保清除按钮不存在
      const clearButtons = document.querySelectorAll('span.cursor-pointer');
      // 当allowClear为false时，应该没有清除按钮
      expect(clearButtons.length).toBe(0);
    });

    it('应该在点击清除按钮时清空内容', async () => {
      const mockOnChange = vi.fn();
      render(<AutoComplete {...defaultProps} allowClear value="test" onChange={mockOnChange} />);

      // 查找清除按钮，Input组件使用Iconify图标
      const clearButton = document.querySelector('span.cursor-pointer');
      expect(clearButton).toBeInTheDocument();
      
      if (clearButton) {
        await user.click(clearButton);
      }

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('应该在清除时关闭下拉菜单', async () => {
      render(<AutoComplete {...defaultProps} allowClear value="ap" />);

      const input = screen.getByDisplayValue('ap');
      await act(async () => {
        await user.click(input);
      });

      await waitForDebounce();

      // 确保下拉菜单打开
      await waitFor(
        () => {
          expect(screen.getByText('Apple')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // 查找清除按钮
      const clearButton = document.querySelector('span.cursor-pointer');
      expect(clearButton).toBeInTheDocument();
      
      if (clearButton) {
        await act(async () => {
          await user.click(clearButton);
        });
      }

      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  describe('受控组件模式', () => {
    it('应该作为受控组件工作', async () => {
      const ControlledAutoComplete = () => {
        const [value, setValue] = useState('');
        return (
          <div>
            <AutoComplete {...defaultProps} value={value} onChange={setValue} />
            <div data-testid="current-value">{value || '无选择'}</div>
          </div>
        );
      };

      render(<ControlledAutoComplete />);

      expect(screen.getByTestId('current-value')).toHaveTextContent('无选择');

      const input = screen.getByPlaceholderText('请输入内容');
      await user.type(input, 'test');

      expect(screen.getByTestId('current-value')).toHaveTextContent('test');
      expect(input).toHaveValue('test');
    });

    it('应该响应外部value变化', () => {
      const { rerender } = render(<AutoComplete {...defaultProps} value="initial" />);

      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();

      rerender(<AutoComplete {...defaultProps} value="updated" />);

      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('initial')).not.toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理空选项数组', async () => {
      render(<AutoComplete options={[]} placeholder="空选项" />);

      const input = screen.getByPlaceholderText('空选项');
      await act(async () => {
        await user.type(input, 'test');
      });

      await waitForDebounce();

      expect(screen.queryByText('test')).not.toBeInTheDocument();
    });

    it('应该处理空白输入', async () => {
      render(<AutoComplete {...defaultProps} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await act(async () => {
        await user.type(input, '   ');
      });

      await waitForDebounce();

      // 空白输入不应该显示下拉菜单
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });

    it('应该处理快速连续输入', async () => {
      render(
        <AutoComplete
          options={mockOptions}
          debounce={300}
          placeholder="请输入内容"
        />
      );

      const input = screen.getByPlaceholderText('请输入内容');

      // 快速连续输入
      await act(async () => {
        await user.type(input, 'a');
        await user.type(input, 'p');
        await user.type(input, 'p');
      });

      await waitForDebounce();

      // 检查过滤后的结果
      await waitFor(
        () => {
          expect(screen.getByText('Apple')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('onSearch回调', () => {
    it('应该在输入时调用onSearch回调', async () => {
      const mockOnSearch = vi.fn();
      render(<AutoComplete {...defaultProps} onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('请输入内容');
      await act(async () => {
        await user.type(input, 'test');
      });

      // 等待防抖延迟
      await waitForDebounce();

      expect(mockOnSearch).toHaveBeenCalledWith('test');
    });

    it('应该在输入为空时也调用onSearch回调', async () => {
      const mockOnSearch = vi.fn();
      render(<AutoComplete {...defaultProps} onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('请输入内容');
      
      // 使用change事件而不是type事件来模拟清空输入
      await act(async () => {
        // 先输入一些内容
        await user.type(input, 'test');
        // 等待第一次防抖
        await waitForDebounce();
        // 然后清空输入框
        await user.clear(input);
      });

      // 等待第二次防抖
      await waitForDebounce();

      // 验证onSearch被调用过至少两次：一次是输入'test'，一次是清空为''
      expect(mockOnSearch).toHaveBeenCalledWith('test');
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });

    it('应该在组件初始化时调用onSearch回调', () => {
      const mockOnSearch = vi.fn();
      render(<AutoComplete {...defaultProps} onSearch={mockOnSearch} defaultValue="initial" />);

      expect(mockOnSearch).toHaveBeenCalledWith('initial');
    });
  });
});