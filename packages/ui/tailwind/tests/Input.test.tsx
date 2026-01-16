import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { Input } from '../src/components/enhanced/Input/Input';

describe('Input', () => {
  it('renders correctly with default props', () => {
    render(<Input />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveClass('w-full');
  });

  it('renders with initial value', () => {
    render(<Input defaultValue="test value" />);
    const inputElement = screen.getByDisplayValue('test value');
    expect(inputElement).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const inputElement = screen.getByRole('textbox');

    fireEvent.change(inputElement, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(inputElement).toHaveValue('new value');
  });

  it('supports controlled component pattern', () => {
    const handleChange = vi.fn();
    render(<Input value="controlled value" onChange={handleChange} />);
    const inputElement = screen.getByDisplayValue('controlled value');

    fireEvent.change(inputElement, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    // Value should not change because it's controlled
    expect(inputElement).toHaveValue('controlled value');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Input size="sm" />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('h-8');

    rerender(<Input size="lg" />);
    expect(inputElement).toHaveClass('h-10');
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Input variant="filled" allowClear value="test" />);
    const container = screen.getByTestId('input-container');
    expect(container).toHaveClass('bg-gray-100');

    rerender(<Input variant="outlined" allowClear value="test" />);
    // For outlined variant, we need to check the container
  });

  it('applies status classes correctly', () => {
    render(<Input status="error" allowClear value="test" />);
    const container = screen.getByTestId('input-container');
    expect(container).toHaveClass('border-red-500');
  });

  it('shows prefix when provided', () => {
    render(<Input prefix={<span>Prefix</span>} />);
    expect(screen.getByText('Prefix')).toBeInTheDocument();
  });

  it('shows suffix when provided', () => {
    render(<Input suffix={<span>Suffix</span>} />);
    expect(screen.getByText('Suffix')).toBeInTheDocument();
  });

  it('shows clear icon when allowClear is true and has value', () => {
    render(<Input allowClear value="test" />);
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('clears input when clear icon is clicked', () => {
    const handleChange = vi.fn();
    render(<Input allowClear value="test" onChange={handleChange} />);
    const clearButton = screen.getByTestId('clear-button');

    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledTimes(1);
    // Since it's controlled, the value won't change in the DOM
    // but we can check if the event was called with empty value
    const event = handleChange.mock.calls[0]?.[0];
    expect(event?.target?.value).toBe('');
  });

  it('focuses input after clearing', () => {
    const handleChange = vi.fn();
    render(<Input allowClear value="test" onChange={handleChange} />);
    const clearButton = screen.getByTestId('clear-button');
    const inputElement = screen.getByRole('textbox');

    // Mock focus method
    const focusSpy = vi.spyOn(inputElement, 'focus');

    fireEvent.click(clearButton);

    expect(focusSpy).toHaveBeenCalled();
  });

  it('does not show clear icon when disabled', () => {
    render(<Input allowClear value="test" disabled />);
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('custom-class');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeDisabled();
  });
});
