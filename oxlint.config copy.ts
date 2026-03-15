import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: {
    correctness: 'error',
    suspicious: 'warn',
    perf: 'warn',
    style: 'off',
  },
  env: {
    node: true,
    browser: true,
  },
  globals: {
    process: 'readonly',
  },
  ignorePatterns: [
    'apps/**/*/{tmp,.dumi}/**/*',
    '*.js',
    '**/*/build/**/*',
    '**/*/es/**/*',
    '**/*/dist/**/*',
    'apps/**/*/public/**/*',
    'node_modules/**/*',
    '**/*.d.ts',
    '**/copy*',
    'apps/web/react-webpack-ie/**/*',
  ],
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test/**'],
      rules: {
        'no-console': 'off',
        'no-magic-numbers': 'off',
      },
    },
    {
      files: ['**/playwright.config.ts'],
      globals: {
        process: 'readonly',
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['typescript'],
      rules: {
        'typescript/no-explicit-any': 'warn',
        'typescript/no-unused-vars': 'error',
        'typescript/no-extraneous-class': ['warn', { allowWithDecorator: true }],
      },
    },
  ],
  plugins: ['typescript', 'unicorn', 'react', 'jsx-a11y'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'eslint/preserve-caught-error': 'off',
    'unicorn/no-empty-file': 'off',
    'no-await-in-loop': 'off',
    'typescript/no-floating-promises': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/prefer-string-replace-all': 'off',
  },
  settings: {
    typescript: {
      project: [
        './tsconfig.json',
        './apps/frontend/react-webpack/tsconfig.json',
        './apps/frontend/react-vite/tsconfig.json',
        './apps/frontend/react-vite-tw/tsconfig.json',
        './apps/backend/eggshell-nest/tsconfig.json',
        './packages/ui/tailwind/tsconfig.app.json',
      ],
    },
  },
});
