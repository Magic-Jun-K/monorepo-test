# 阶段1：基础环境
FROM node:22-slim AS base
RUN npm i -g pnpm
# 设置pnpm环境变量
ENV PNPM_HOME="/pnpm"
# 设置pnpm路径
ENV PATH="$PNPM_HOME:$PATH"

# 阶段2：安装依赖
FROM base AS deps
# 设置容器内工作目录
WORKDIR /app
# 复制 monorepo 配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# 复制 TypeScript 配置
COPY tsconfig* ./
# 复制后端应用代码
COPY apps/backend/bmap-nest/ ./apps/backend/bmap-nest/
# 安装所有依赖（包含 devDependencies）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# 阶段3：构建应用
FROM deps AS builder
WORKDIR /app/apps/backend/bmap-nest
ENV NODE_OPTIONS="--experimental-vm-modules"
# 在子包目录下执行构建
# RUN pnpm build
# 清理可能存在的 dist 目录
RUN rm -rf dist || true
# 显示当前目录和文件
RUN echo "=== 当前工作目录 ===" && pwd && ls -la
# 显示 TypeScript 配置
RUN echo "=== TypeScript 配置 ===" && cat tsconfig.json
# 显示 TypeScript 构建配置
RUN echo "=== TypeScript 构建配置 ===" && cat tsconfig.build.json
# 显示源代码目录
RUN echo "=== 源代码目录 ===" && ls -la src/
# 使用 tsconfig.build.json 来构建（添加详细输出）
RUN npx tsc --project tsconfig.build.json --listFiles --listEmittedFiles
# 验证构建产物
RUN echo "=== 检查构建产物 ===" && \
    ls -la dist/ && \
    test -f dist/main.js || (echo "main.js 不存在，构建失败" && exit 1)

# 阶段4：生产环境
FROM base AS production
WORKDIR /app
# 复制构建产物
COPY --from=builder /app/apps/backend/bmap-nest/dist ./dist
COPY --from=builder /app/apps/backend/bmap-nest/public ./public
# COPY --from=builder /app/apps/backend/bmap-nest/package.json ./
# 复制 monorepo 配置文件（用于 pnpm 解析依赖）
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
# 复制子包 package.json（用于 workspace 解析）
COPY --from=builder /app/apps/backend/bmap-nest/package.json ./apps/backend/bmap-nest/

# 安装生产依赖
# 添加--unsafe-perm以允许构建脚本运行
# RUN pnpm install --prod --unsafe-perm
# --ignore-scripts: 跳过所有脚本执行（避免 husky prepare 失败）
# --shamefully-hoist: 将所有依赖提升到 node_modules 根目录，避免符号链接问题
# --prefer-offline: 优先使用缓存，加速安装
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --shamefully-hoist --prefer-offline --ignore-scripts

# 暴露端口
EXPOSE 7000
# 启动应用
CMD ["node", "--experimental-specifier-resolution=node", "dist/main.js"]