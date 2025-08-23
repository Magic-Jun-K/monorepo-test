import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config({
  // 继承自什么配置
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  // 那些文件需要用这个配置
  files: ['**/*.{ts,tsx,js}'],
  // 那些文件不用这个配置
  ignores: [
    'apps/**/*/{tmp,.dumi}/**/*',
    '*.js',
    '**/*/build/**/*',
    '**/*/es/**/*',
    '**/*/dist/**/*',
    'apps/**/*/public/**/*',
    'packages/**/*/*.d.ts',
    'packages/**/*/*.config.*',
    'packages/**/*/uno.config.*'
  ],
  // 自定义规则配置
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  },
  // 语言选项
  languageOptions: {
    // 转换器
    parser: tseslint.parser,
    // 转换选项
    parserOptions: {
      // ts 项目的 tsconfig 文件位置
      project: [
        './tsconfig.json',
        './apps/frontend/react-webpack/tsconfig.json',
        './apps/frontend/react-vite/tsconfig.json',
        './apps/frontend/react-vite-tw/tsconfig.json',
        './apps/backend/bmap-nest/tsconfig.json',
        './packages/unocss-ui/tsconfig.json'
      ],
      // ts 配置更目录
      tsconfigRootDir: __dirname
    }
  }
});
