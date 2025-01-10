import tsEslintParser from '@typescript-eslint/parser';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    // TypeScript 文件配置
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsEslintParser, // 使用 TypeScript 解析器
      parserOptions: {
        project: './tsconfig.json', // 指定 tsconfig.json
        tsconfigRootDir: import.meta.dirname, // 指定 tsconfig.json 的根目录
        sourceType: 'module', // 使用 ES 模块
      },
      ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin, // 加载 TypeScript 插件
      prettier: prettierPlugin, // 加载 Prettier 插件
    },
    rules: {
      ...prettierConfig.rules, // 应用 Prettier 的规则
      '@typescript-eslint/interface-name-prefix': 'off', // 关闭特定规则
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // JavaScript 文件配置
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
      sourceType: 'module', // 使用 ES 模块
    },
    rules: {
      'prettier/prettier': 'error', // 启用 Prettier 格式化检查
    },
  },
  {
    // 全局忽略文件
    ignores: ['.eslintrc.js'],
  },
];
