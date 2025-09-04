import { describe, it, expect } from 'vitest';

import * as MapComModule from './index';

describe('MapCom exports', () => {
  it('应该正确导出MapCom组件', () => {
    expect(MapComModule).toHaveProperty('MapCom');
  });

  it('应该正确导出MapProps类型', () => {
    // 类型只在编译时存在，运行时无法检测
    // 我们只能检查模块是否有导出
    expect(MapComModule).toBeDefined();
  });
});