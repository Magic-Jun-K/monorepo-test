// 导出所有类型
export * from './types';

// 导出共享工具函数
export * from './shared/utils';

// 注意：不导出具体的实现函数，让用户根据环境选择
// 前端项目应该导入 from '@eggshell/shared-crypto/browser'
// 后端项目应该导入 from '@eggshell/shared-crypto/node'

// 提供一个简单的环境检测和警告
export function checkEnvironment() {
  if (typeof window !== 'undefined') {
    console.warn(
      '❌ 警告：在前端项目中使用 @shared/crypto 根导出可能包含 Node.js 特定代码\n' +
        '✅ 建议改为：import { ... } from "@shared/crypto/browser"',
    );
  }
}
