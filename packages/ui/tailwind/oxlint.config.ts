import { defineConfig } from 'oxlint';
import rootConfig from '../../../oxlint.config.ts';

export default defineConfig({
  extends: [rootConfig],
  env: {
    browser: true,
    es2022: true,
  },
  globals: {
    React: 'readonly',
    JSX: 'readonly',
    global: 'readonly',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.config.js', '*.config.ts', 'vite.config.ts'],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
});
