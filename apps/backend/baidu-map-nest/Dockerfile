# 阶段1：基础环境
FROM node:22-slim AS base
RUN npm i -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com
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
COPY apps/backend/baidu-map-nest/ ./apps/backend/baidu-map-nest/
# 安装所有依赖（包含 devDependencies）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile \
    --filter="@backend/baidu-map-nest..." && \
    # 添加依赖树检查
    pnpm list --depth=5

# 阶段3：构建应用
FROM deps AS be-build
WORKDIR /app/apps/backend/baidu-map-nest
ENV NODE_OPTIONS="--experimental-vm-modules"
RUN pnpm build

# 暴露端口
EXPOSE 7000
CMD ["node", "--experimental-specifier-resolution=node", "dist/main.js"]