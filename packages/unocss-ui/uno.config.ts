import { defineConfig, presetUno, presetAttributify } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(), // 核心原子化预设
    presetAttributify() // 支持属性化模式（可选）
  ],
  // 组件库专用规则（按需添加）
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
  }
});
