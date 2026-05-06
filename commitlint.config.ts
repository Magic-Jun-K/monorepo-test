import type { UserConfig } from 'cz-git';
import { readdirSync } from 'node:fs';

/**
 * 获取指定目录下的直接子目录名称
 * @param packagePath 要扫描的目录路径
 * @returns 所有直接子目录名称的数组
 */
const getPackages = (packagePath: string): string[] => {
  const result: string[] = [];

  try {
    const entries = readdirSync(packagePath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        result.push(entry.name);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${packagePath}:`, error);
  }

  return result;
};

/**
 * 为指定目录下的所有子目录添加前缀
 * @param packagePath 要处理的目录路径
 * @param prefix 要添加的前缀
 * @returns 所有子目录路径的数组，每个路径都添加了前缀
 */
const getPrefixedPackages = (packagePath: string, prefix: string): string[] => {
  const packages = getPackages(packagePath);
  return packages.map((pkg) => `${prefix}:${pkg}`);
};

const scopes = [
  // ...getPackages('apps'),
  ...getPrefixedPackages('packages', 'packages'),
  ...getPrefixedPackages('packages/ui', 'ui'),
  ...getPrefixedPackages('packages/shared', 'shared'),
  ...getPrefixedPackages('apps/api', 'api'),
  ...getPrefixedPackages('apps/backend', 'backend'),
  ...getPrefixedPackages('apps/web', 'web'),
  ...getPrefixedPackages('apps/frontend', 'frontend'),
  'docs', // 当你修改项目文档时使用，例如 README、API 文档、使用说明等
  'project', // 当你修改项目整体配置或结构时使用，例如修改项目根目录下的配置文件、调整项目架构等
  'style', // 当你进行代码风格调整但不影响功能时使用，例如格式化代码、调整缩进、修改 CSS 样式等
  'ci', // 当你修改持续集成/持续部署相关配置时使用，例如修改 GitHub Actions、Jenkins 配置等
  'dev', // 当你修改开发环境或开发工具配置时使用，例如修改 webpack、vite 配置、调整开发环境变量等
  'deploy', // 当你修改部署相关的配置或脚本时使用，例如修改 Docker 配置、部署脚本等
  'other', // 当你的修改不属于上述任何一种情况时使用，作为一个兜底的选项
];

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
    'scope-enum': [2, 'always', scopes],
  },
  prompt: {
    // 修复文档中的拼写错误
    alias: { fd: 'docs: fix typos' },
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围（可选）:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixesSelect: '选择关联issue前缀（可选）:',
      customFooterPrefix: '输入自定义issue前缀 :',
      footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
      confirmCommit: '是否提交或修改commit ?',
    },
    types: [
      { value: 'feat', name: 'feat:     新增功能 | A new feature' },
      { value: 'fix', name: 'fix:      修复缺陷 | A bug fix' },
      { value: 'docs', name: 'docs:     文档更新 | Documentation only changes' },
      {
        value: 'style',
        name: 'style:    代码格式 | Changes that do not affect the meaning of the code',
      },
      {
        value: 'refactor',
        name: 'refactor: 代码重构 | A code change that neither fixes a bug nor adds a feature',
      },
      { value: 'perf', name: 'perf:     性能提升 | A code change that improves performance' },
      {
        value: 'test',
        name: 'test:     测试相关 | Adding missing tests or correcting existing tests',
      },
      {
        value: 'build',
        name: 'build:    构建相关 | Changes that affect the build system or external dependencies',
      },
      {
        value: 'ci',
        name: 'ci:       持续集成 | Changes to our CI configuration files and scripts',
      },
      { value: 'revert', name: 'revert:   回退代码 | Revert to a commit' },
      {
        value: 'chore',
        name: 'chore:    其他修改 | Other changes that do not modify src or test files',
      },
    ],
    useEmoji: false, // 禁用 emoji 图标
    emojiAlign: 'center', // 居中对齐 emoji
    useAI: false, // 禁用 AI 功能
    aiNumber: 1, // 限制 AI 建议数量为 1
    themeColorCode: '', // 不使用主题颜色
    // scopes: [],
    scopes: scopes, // 启用自定义范围
    allowCustomScopes: true, // 允许自定义范围
    // allowEmptyScopes: true,
    allowEmptyScopes: false, // 禁用空范围
    customScopesAlign: 'bottom', // 自定义范围底部对齐
    customScopesAlias: 'custom', // 自定义范围别名
    emptyScopesAlias: 'empty', // 空范围别名
    upperCaseSubject: false, // 不将 subject 转换为大写
    markBreakingChangeMode: false, // 不标记重大变更
    allowBreakingChanges: ['feat', 'fix'], // 允许在 feat 和 fix 类型中添加重大变更
    breaklineNumber: 100, // 限制每行字符数为 100
    breaklineChar: '|', // 使用 | 换行
    skipQuestions: [], // 跳过问题
    // issue 前缀配置
    issuePrefixes: [
      // 如果使用 gitee 作为开发管理
      { value: 'link', name: 'link:     链接 ISSUES 进行中' },
      { value: 'closed', name: 'closed:   标记 ISSUES 已完成' },
    ],
    customIssuePrefixAlign: 'top', // 自定义 issue 前缀顶部对齐
    emptyIssuePrefixAlias: 'skip', // 空 issue 前缀别名
    customIssuePrefixAlias: 'custom', // 自定义 issue 前缀别名
    allowCustomIssuePrefix: true, // 允许自定义 issue 前缀
    allowEmptyIssuePrefix: true, // 允许空 issue 前缀
    confirmColorize: true, // 确认提交时使用颜色
    scopeOverrides: undefined, // 作用域覆盖配置
    defaultBody: '', // 默认 body 为空
    defaultIssues: '', // 默认 issues 为空
    defaultScope: '', // 默认 scope 为空
    defaultSubject: '', // 默认 subject 为空
  },
} satisfies UserConfig;
