import { FC, useEffect, useRef } from 'react';

export interface EChartsProps {
  option: Record<string, unknown>;
  style?: React.CSSProperties;
  className?: string;
}

export const ECharts: FC<EChartsProps> = ({ option, style, className }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 这里应该是 ECharts 的初始化逻辑
    // 为了简化，我们只创建一个容器
    if (chartRef.current) {
      // 模拟 ECharts 初始化
      console.log('初始化 ECharts 图表');
    }
  }, [option]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '100%', ...style }}
      className={className}
      data-testid="echarts-container"
    />
  );
};
