# 阶段1：基础环境
FROM node:22-slim AS base
RUN npm i -g pnpm
# RUN pnpm config set registry https://registry.npmmirror.com
# 设置pnpm环境变量
ENV PNPM_HOME="/pnpm"
# 设置pnpm路径
ENV PATH="$PNPM_HOME:$PATH"

# 阶段2：安装依赖
FROM base AS deps
# 设置容器内工作目录
WORKDIR /app
# COPY . ./
# 复制整个monorepo结构
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig* ./
COPY packages/unocss-ui/ ./packages/unocss-ui/
COPY packages/antd-ui/ ./packages/antd-ui/
COPY apps/frontend/react-webpack/ ./apps/frontend/react-webpack/
# 安装所有依赖（包含 devDependencies）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile \
    --filter="@eggshell/unocss-ui..." \
    --filter="@eggshell/antd-ui..." \
    --filter="@frontend/react-webpack..."

# 阶段3：构建应用
FROM deps AS fe-build
RUN pnpm --filter @eggshell/unocss-ui build
RUN pnpm --filter @eggshell/antd-ui build
# 切换到前端应用目录
WORKDIR /app/apps/frontend/react-webpack
RUN pnpm build:baiduMap --stats=detailed
# 1. 检查 webpack 是否存在
# RUN ls -l ./node_modules/.bin/webpack
# 2. 执行构建并保留详细日志
# RUN ./node_modules/.bin/webpack --config webpack.config.mjs --env production --stats=detailed
# 3. 确认构建产物路径
# RUN ls -l ./build

# 阶段4：运行环境
FROM nginx:latest
# 复制构建好的前端文件到Nginx的默认目录
COPY --from=fe-build /app/apps/frontend/react-webpack/build /usr/share/nginx/html
# 复制Nginx配置文件
COPY apps/frontend/react-webpack/nginx.conf /etc/nginx/conf.d/default.conf
# 暴露Nginx的默认端口
EXPOSE 80