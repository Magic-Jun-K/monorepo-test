# 阶段1：构建前端应用
FROM node:20-slim AS base
RUN npm i -g pnpm
# 设置pnpm环境变量
ENV PNPM_HOME="/pnpm"
# 设置pnpm路径
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS build
COPY . /app
# 设置容器内工作目录
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# RUN pnpm deploy --filter=baidu-map-react /apps/frontend/baidu-map-react

FROM base AS baidu-map-react-build
COPY --from=build /apps/frontend/baidu-map-react /app/eggshell/frontend/baidu-map-react
COPY tsconfig.json tsconfig.client.json /app/eggshell
WORKDIR /app/eggshell/frontend/baidu-map-react
RUN pnpm build:baiduMap

# 阶段2：使用Nginx作为Web服务器
FROM nginx:latest

# 复制构建好的前端文件到Nginx的默认目录
COPY --from=baidu-map-react-build --chown=appuser:appgroup /app/apps/frontend/baidu-map-react/build /usr/share/nginx/html
# 复制Nginx配置文件
COPY --chown=appuser:appgroup apps/frontend/baidu-map-react/nginx.conf /etc/nginx/conf.d/default.conf

# 设置用户
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

# 暴露Nginx的默认端口
EXPOSE 80
# 启动Nginx服务
CMD ["nginx", "-g", "daemon off;"]    