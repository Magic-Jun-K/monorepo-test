/** @type {import('tailwindcss').Config} */
export default {
  // content：指定 Tailwind 扫描的文件路径（用于生成原子化样式）
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/**/*.module.scss' // 添加对 SCSS Modules 的支持
  ],
  // theme：自定义颜色、字体、间距等样式规则
  theme: {
    extend: {
      // colors: {
      //   primary: '#1fb6ff', // 自定义颜色
      //   secondary: '#7e5bef',
      // },
      // spacing: {
      //   '128': '32rem', // 自定义间距
      // },
      // borderRadius: {
      //   '4xl': '2rem', // 自定义圆角
      // },
    }
  },
  // plugins：添加第三方插件或自定义插件
  plugins: []
};
