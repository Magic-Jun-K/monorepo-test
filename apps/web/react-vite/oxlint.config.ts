import { defineConfig } from 'oxlint';
import rootConfig from '../../../oxlint.config.ts';

export default defineConfig({
  extends: [rootConfig],
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ['dist/**/*', 'build/**/*', 'node_modules/**/*'],
  rules: {
    'no-console': 'off',
    'typescript/no-unused-vars': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'typescript/no-explicit-any': 'off',
  },
});
