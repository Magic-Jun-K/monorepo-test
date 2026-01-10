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
# 复制整个monorepo结构
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig* ./
COPY apps/backend/bmap-nest/ ./apps/backend/bmap-nest/
# 安装所有依赖（包含 devDependencies）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile \
    --filter="@backend/bmap-nest..."

# 阶段3：构建应用
FROM deps AS builder
# WORKDIR /app/apps/backend/bmap-nest
WORKDIR /app
ENV NODE_OPTIONS="--experimental-vm-modules"
# RUN pnpm build
RUN pnpm --filter @backend/bmap-nest build

# 阶段4：生产环境
FROM base AS production
WORKDIR /app
# 复制构建产物和必要文件
COPY --from=builder /app/apps/backend/bmap-nest/dist ./dist
COPY --from=builder /app/apps/backend/bmap-nest/public ./public
COPY --from=builder /app/apps/backend/bmap-nest/package.json ./
# 复制 monorepo 根目录配置文件（从 builder 阶段）
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# 只安装生产依赖
# 添加--unsafe-perm以允许构建脚本运行
# RUN pnpm install --prod --unsafe-perm
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# 暴露端口
EXPOSE 7000
# 启动应用
CMD ["node", "--experimental-specifier-resolution=node", "dist/main.js"]