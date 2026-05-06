/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  customSyntax: 'postcss-scss',
  rules: {
    'block-no-empty': true,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer'],
      },
    ],
    'import-notation': null,
  },
};
