import type { CSpellUserSettings } from 'cspell';

const config: CSpellUserSettings = {
  // 基础配置
  version: '0.2', // 配置文件版本
  language: 'en-US', // 语言设置
  caseSensitive: false, // 是否区分大小写
  // 导入词典配置
  import: ['@cspell/dict-lorem-ipsum/cspell-ext.json'],
  // 启用的词典
  dictionaries: ['custom-words', 'typescript', 'node', 'en_us'],
  // 自定义词典定义
  dictionaryDefinitions: [
    {
      name: 'custom-words',
      path: './.cspell/custom-words.txt',
      addWords: true,
    },
  ],
  // 忽略路径配置
  ignorePaths: [
    '**/node_modules/**',
    '**/dist/**',
    '**/lib/**',
    '**/build/**',
    '**/public/**/*',
    '**/coverage/**',
    '**/docs/**',
    '**/scripts/**',
    '**/.turbo/**',
    '**/*.snap',
    '**/*.svg',
    '**/*.png',
    '**/*.jpg',
    '**/stats.html',
    '**/*.html',
    '**/package.json',
    'eslint.config.*',
    'commitlint.config.*',
    '.git/**',
    '**/tsconfig.json',
    '**/*.tsbuildinfo',
    '**/vite.config.*',
    '**/webpack.config.*',
    '**/*.d.ts',
    '**/* copy*',
    '**/packages/unocss-ui-ie/**',
    '**/packages/core-business-components/**',
  ],
  // 忽略正则表达式列表
  ignoreRegExpList: [
    /\\b[A-Z][a-z]+[A-Z][a-z]+\\b/g, // 驼峰命名（如 "helloWorld"）
    /\\b[A-Z]{2,}\\b/g, // 连续大写（如 "API", "URL"）
    /\\d+/g,
  ],
  // 自定义单词列表
  words: [],
  // 忽略单词列表
  ignoreWords: ['TODO', 'FIXME', 'DEBUG', 'HACK', 'XXX'],
};
export default config;
