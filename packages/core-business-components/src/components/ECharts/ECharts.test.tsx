import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

import { ECharts } from './ECharts';

describe('ECharts', () => {
  const mockOption = {
    title: {
      text: '测试图表',
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar',
      },
    ],
  };

  it('应该正确渲染图表容器', () => {
    render(<ECharts option={mockOption} />);

    const chartContainer = screen.getByTestId('echarts-container');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveStyle({ width: '100%', height: '100%' });
  });

  it('应该应用传入的样式', () => {
    const customStyle = { backgroundColor: 'red', width: '500px' };

    render(<ECharts option={mockOption} style={customStyle} />);

    const chartContainer = screen.getByTestId('echarts-container');
    expect(chartContainer).toHaveStyle('background-color: rgb(255, 0, 0)');
    expect(chartContainer).toHaveStyle('width: 500px');
  });

  it('应该应用传入的类名', () => {
    const customClassName = 'custom-chart';

    render(<ECharts option={mockOption} className={customClassName} />);

    const chartContainer = screen.getByTestId('echarts-container');
    expect(chartContainer).toHaveClass(customClassName);
  });
});
