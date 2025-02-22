import { FC, useRef, useEffect } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件和图表类型
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  CanvasRenderer
]);

const EChartsCom: FC<{ options: echarts.EChartsCoreOption }> = ({ options }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const _echarts: any = echarts;
    const chart = _echarts.init(chartRef.current, null, { renderer: 'canvas' });

    chart.setOption(options); // 渲染图表

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      chart.dispose();
    };
  }, [options]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};
export default EChartsCom;
