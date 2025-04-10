import { FC, useRef, useEffect, memo } from 'react';
import { init, use as registerECharts } from 'echarts/core';
import type { EChartsCoreOption, SetOptionOpts } from 'echarts/core';

// 1. 按需引入组件
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 2. 一次性注册所有依赖（在模块顶层执行）
registerECharts([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer
]);

// 3. 初始化配置类型（无需 dependencies）
type EChartsInitOpts = Parameters<typeof init>[2];

const initOpts: EChartsInitOpts = {
  renderer: 'canvas',
  useDirtyRect: true, // 仅限 5.3.0+ 版本
  useCoarsePointer: true // 仅限 5.4.0+ 版本
};

interface EChartsComProps {
  options: EChartsCoreOption;
  className?: string;
  style?: React.CSSProperties;
}

const EChartsCom: FC<EChartsComProps> = ({ options, className, style }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ReturnType<typeof init>>();

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = init(chartRef.current, null, initOpts);

    // 响应式处理
    const resizeHandler = () => chartInstance.current?.resize();
    const observer = new ResizeObserver(resizeHandler);
    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      chartInstance.current?.dispose();
    };
  }, []);

  // 配置更新
  useEffect(() => {
    chartInstance.current?.setOption(options, {
      lazyUpdate: true,
      replaceMerge: ['series', 'dataset']
    } as SetOptionOpts);
  }, [options]);

  return (
    <div ref={chartRef} className={className} style={{ width: '100%', height: '100%', ...style }} />
  );
};
export default memo(EChartsCom);
