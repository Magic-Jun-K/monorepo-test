import type { UserConfig } from 'cz-git';
import fg from 'fast-glob';

// 用于获取所有包的名称
const getPackages = (packagePath: string) =>
  fg.sync('*', { cwd: packagePath, onlyDirectories: true, deep: 2 });

// 用于获取带前缀的包名
const getPrefixedPackages = (packagePath: string, prefix: string) => {
  const packages = getPackages(packagePath);
  return packages.map((pkg) => `${prefix}:${pkg}`);
};

const scopes = [
  // ...getPackages('apps'),
  ...getPrefixedPackages('packages', 'packages'),
  ...getPrefixedPackages('packages/ui', 'ui'),
  ...getPrefixedPackages('packages/shared', 'shared'),
  ...getPrefixedPackages('apps/frontend', 'frontend'),
  ...getPrefixedPackages('apps/backend', 'backend'),
  ...getPrefixedPackages('apps/web', 'web'),
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
    useEmoji: false,
    emojiAlign: 'center',
    useAI: false,
    aiNumber: 1,
    themeColorCode: '',
    // scopes: [],
    scopes: scopes,
    allowCustomScopes: true,
    // allowEmptyScopes: true,
    allowEmptyScopes: false,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [
      // 如果使用 gitee 作为开发管理
      { value: 'link', name: 'link:     链接 ISSUES 进行中' },
      { value: 'closed', name: 'closed:   标记 ISSUES 已完成' },
    ],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
} satisfies UserConfig;
