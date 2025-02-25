# 阶段1：构建前端应用
FROM node:20-alpine AS builder
# 设置容器内工作目录
WORKDIR /app

# 1、优先复制包管理文件（利用Docker缓存层）
# 复制monorepo根目录的必要文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/baiduMap-react/package.json ./apps/frontend/baiduMap-react/

# 2、安装依赖（带双缓存）
RUN --mount=type=cache,target=/root/.pnpm-store \
    --mount=type=cache,target=node_modules/.cache \
    corepack enable && \
    corepack prepare pnpm@8.15.9 --activate && \
    pnpm config set store-dir /root/.pnpm-store && \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm store prune && \
    pnpm install --filter @frontend/baidu-map-react... \
    --frozen-lockfile \
    --prefer-offline

# 3、复制前端项目源码（精确到指定项目）
COPY apps/frontend/baiduMap-react/src ./apps/frontend/baiduMap-react/src
COPY apps/frontend/baiduMap-react/public ./apps/frontend/baiduMap-react/public
COPY apps/frontend/baiduMap-react/tsconfig.json \
     apps/frontend/baiduMap-react/webpack.config.mjs \
     apps/frontend/baiduMap-react/

# 4、构建前端应用（构建优化）
ENV NODE_ENV=production \
    GENERATE_SOURCEMAP=false
RUN --mount=type=cache,target=.turbo \
    pnpm build --filter @frontend/baidu-map-react \
    --output-logs=errors-only \
    --cache-dir=.turbo \
    --force

# 阶段2：使用Nginx作为Web服务器
FROM nginx:1.27-alpine

# 安全配置（关键改进）
RUN apk add --no-cache su-exec && \
    addgroup -S -g 1001 appgroup && \
    adduser -S -G appgroup -u 1001 appuser && \
    chown -R appuser:appgroup /var/cache/nginx && \
    rm -f /etc/nginx/conf.d/*  # 清理默认配置

# 复制构建好的前端文件到Nginx的默认目录
COPY --from=builder --chown=appuser:appgroup /app/apps/frontend/baiduMap-react/build /usr/share/nginx/html
# 复制Nginx配置文件
COPY --chown=appuser:appgroup apps/frontend/baiduMap-react/nginx.conf /etc/nginx/conf.d/default.conf

# 设置用户
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

# 暴露Nginx的默认端口
EXPOSE 80
# 启动Nginx服务
CMD ["nginx", "-g", "daemon off;"]    