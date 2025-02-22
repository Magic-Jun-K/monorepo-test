import autoprefixer from 'autoprefixer'
import postcssPresetEnv from 'postcss-preset-env';

export default {
  plugins: [
    /* 自动添加前缀 */
    autoprefixer({
      overrideBrowserslist: [
        'ie >= 10', // 明确指定 IE10
        'last 2 versions' // 保持对其他现代浏览器的支持
      ],
    }),
    /* 处理CSS新特性 */
    postcssPresetEnv({
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': {
          preserve: false, // 完全转换CSS变量
        },
        'logical-properties-and-values': false // 关闭IE不支持的逻辑属性
      }
    })
  ]
}