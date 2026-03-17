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
# 复制共享组件库代码
COPY packages/shared/crypto/ ./packages/shared/crypto/
# 复制后端应用代码
COPY apps/api/eggshell-nest/ ./apps/api/eggshell-nest/
# 安装所有依赖（包含 devDependencies）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# 阶段3：构建应用
FROM deps AS builder
# 构建共享依赖
RUN pnpm --filter @eggshell/shared-crypto build
WORKDIR /app/apps/api/eggshell-nest
ENV NODE_OPTIONS="--experimental-vm-modules"
# 清理可能存在的 dist 目录
RUN rm -rf dist || true
# 使用 nest build (swc) 来构建
RUN pnpm build

# 阶段4：生产环境
FROM node:22-alpine AS production
# 安装 pnpm
RUN npm i -g pnpm
# 设置环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
# 复制构建产物
COPY --from=builder /app/apps/api/eggshell-nest/dist ./dist
COPY --from=builder /app/apps/api/eggshell-nest/public ./public
# 复制 monorepo 配置文件（用于 pnpm 解析依赖）
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
# 复制子包 package.json（用于 workspace 解析）
COPY --from=builder /app/apps/api/eggshell-nest/package.json ./apps/api/eggshell-nest/
# 复制并安装 workspace 依赖
COPY --from=builder /app/packages/shared/crypto ./packages/shared/crypto

# 安装生产依赖
# --ignore-scripts: 跳过所有脚本执行（避免 husky prepare 失败）
# --shamefully-hoist: 将所有依赖提升到 node_modules 根目录，避免符号链接问题
# --prefer-offline: 优先使用缓存，加速安装
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --shamefully-hoist --prefer-offline --ignore-scripts
# 添加 python3 make g++ 以支持 native 模块构建 (如 argon2)
# RUN apk add --no-cache python3 make g++

# 暴露端口
EXPOSE 7000

# 确保生产环境 package.json 不强制 ESM (如果存在 type: module 则移除)
RUN sed -i '/"type": "module"/d' ./package.json || true

# 启动应用
CMD ["node", "dist/main.js"]