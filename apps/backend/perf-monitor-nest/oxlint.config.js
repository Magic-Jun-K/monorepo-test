import { defineConfig } from 'oxlint';
import rootConfig from '../../../oxlint.config.ts';

module.exports = defineConfig({
  extends: [rootConfig],
  globals: {
    console: 'readonly',
    process: 'readonly',
    setTimeout: 'readonly',
    setInterval: 'readonly',
    clearTimeout: 'readonly',
    clearInterval: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    jest: 'readonly',
  },
  ignorePatterns: ['dist/**/*', 'build/**/*', 'node_modules/**/*', 'eslint.config.mjs'],
  rules: {
    'no-console': 'off',
    'no-undef': 'off',
    'unicorn/no-array-sort': 'off',
    'typescript/no-unused-vars': 'error',
    'typescript/no-explicit-any': 'warn',
    'typescript/no-floating-promises': 'warn',
    'typescript/no-unsafe-argument': 'warn',
  },
});
