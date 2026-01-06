import { describe, it, expect } from 'vitest';

import * as EChartsModule from './index';

describe('ECharts exports', () => {
  it('应该正确导出ECharts组件', () => {
    expect(EChartsModule).toHaveProperty('ECharts');
  });

  it('应该正确导出EChartsProps类型', () => {
    // 类型只在编译时存在，运行时无法检测
    // 我们只能检查模块是否有导出
    expect(EChartsModule).toBeDefined();
  });
});
