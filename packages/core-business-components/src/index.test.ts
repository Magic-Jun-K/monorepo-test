import { describe, it, expect } from 'vitest';

import * as MainModule from './index';

describe('Main exports', () => {
  it('应该正确导出MapCom组件', () => {
    expect(MainModule).toHaveProperty('MapCom');
  });

  it('应该正确导出MapSearch组件', () => {
    expect(MainModule).toHaveProperty('MapSearch');
  });
});