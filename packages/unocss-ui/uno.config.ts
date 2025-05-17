import { defineConfig, presetWind4, presetAttributify, transformerDirectives, presetIcons } from 'unocss';

// 官方预设文档：https://unocss.dev/presets/
// 66.0.0版本开始，presetUno改为presetWind3
export default defineConfig({
  presets: [
    // presetWind3(), // 核心原子化预设
    presetWind4(), // 核心原子化预设
    presetAttributify(), // 支持属性化模式（可选）
    presetIcons({
      scale: 1.2, // 图标缩放比例
      cdn: 'https://esm.sh/' // 使用CDN加载图标
    })
  ],
  // 启用 class 转换
  transformers: [
    transformerDirectives() // 启用指令转换器
  ],
  // 组件库专用规则（按需添加）
  // 自定义规则
  rules: [
    ['flex-center', { display: 'flex', 'align-items': 'center', 'justify-content': 'center' }]
  ],
  theme: {
    fontSize: {
      // 设置默认字体大小
      base: '1rem', // 1rem 等于 16px
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '24px',
      '2xl': '2rem',
      '3xl': '3rem',
      '4xl': '4rem',
      '5xl': '5rem',
      '6xl': '6rem'
    },
    screens: {
      sm: '640px', // 小屏
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px', // 2K基准
      '4xl': '2560px', // 4K基准
      '8xl': '3840px' // 8K基准
    }
  },
  content: {
    pipeline: {
      include: [
        // 确保包含 styles.ts 文件
        '**/*.{html,js,ts,tsx}',
        './src/components/**/styles.ts'
      ]
    }
  }
});
