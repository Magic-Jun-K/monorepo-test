/** @type {import('tailwindcss').Config} */
export default {
  // 开启darkMode
  darkMode: ["class"],
  // 配置tailwindcss的内容路径，文件扫描范围和优化作用
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // 配置tailwindcss的容器居中和内边距
    container: {
      center: true, // 配置tailwindcss的容器居中
      padding: "2rem", // 配置tailwindcss的容器内边距
      // 配置tailwindcss的容器最大宽度
      screens: {
        "2xl": "1400px",
      },
    },
    // 配置tailwindcss的颜色变量
    extend: {
      // 配置tailwindcss的颜色变量
      colors: {
        border: "hsl(var(--border))", // 边框颜色
        input: "hsl(var(--input))", // 输入框颜色
        ring: "hsl(var(--ring))", // 环颜色
        background: "hsl(var(--background))", // 背景颜色
        foreground: "hsl(var(--foreground))", // 默认文字颜色
        // 主要操作和重要元素
        primary: {
          DEFAULT: "hsl(var(--primary))", // 主要背景色
          foreground: "hsl(var(--primary-foreground))", // 在主色背景上的文字颜色
        },
        // 次要操作和辅助元素
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // 危险操作（删除、警告）
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // 次要内容、禁用状态
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // 突出显示元素
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // 弹出层、下拉菜单
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // 卡片组件
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // 圆角系统的层级关系
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // 动画关键帧的作用（配合Radix UI）
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      // 动画时长和缓动函数
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: []
}