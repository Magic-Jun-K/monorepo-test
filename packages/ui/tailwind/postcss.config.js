export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    // 添加CSSnano来压缩CSS
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: [
              'advanced',
              {
                // 移除重复规则
                mergeRules: true,
                // 移除重复媒体查询
                mergeLonghand: true,
                // 移除不必要的前缀
                autoprefixer: true,
                // 移除注释
                discardComments: true,
                // 移除空规则
                discardEmpty: true,
                // 移除重复字体规则
                uniqueSelectors: true,
                // 优化calc()
                calc: true,
                // 压缩颜色值
                colormin: true,
                // 压缩字体
                fontweight: true,
                // 压缩阴影像
                orderedValues: true,
                // 移除过时的样式
                discardObsolete: true,
                // 压缩媒体查询
                minifySelectors: true,
                // 压缩空白
                normalizeWhitespace: true,
              },
            ],
          },
        }
      : {}),
  },
};
