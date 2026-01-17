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
# COPY . ./
# 复制 monorepo 配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# 复制 TypeScript 配置
COPY tsconfig* ./
# 复制 UI 组件库代码
COPY packages/ui/tailwind/ ./packages/ui/tailwind/
COPY packages/ui/antd/ ./packages/ui/antd/
# 复制核心业务组件库代码
COPY packages/core-business-components/ ./packages/core-business-components/
# 复制前端端应用代码
COPY apps/frontend/react-webpack/ ./apps/frontend/react-webpack/
# 安装所有依赖（包含 devDependencies）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
    # pnpm install \
    # --filter="@eggshell/ui-tailwind..." \
    # --filter="@eggshell/ui-antd..." \
    # --filter="@eggshell/core-business-components"\
    # --filter="@frontend/react-webpack..."

# 阶段3：构建应用
FROM deps AS fe-build
RUN pnpm --filter @eggshell/ui-tailwind build
RUN pnpm --filter @eggshell/ui-antd build
RUN pnpm --filter @eggshell/core-business-components build
# 切换到前端应用目录
WORKDIR /app/apps/frontend/react-webpack
# 清除 webpack 缓存
RUN rm -rf .webpack_temp_cache || true
RUN pnpm build --stats=detailed

# 阶段4：运行环境
FROM nginx:1.28.1-alpine
# 复制构建好的前端文件到Nginx的默认目录
COPY --from=fe-build /app/apps/frontend/react-webpack/build /usr/share/nginx/html
# 复制Nginx配置文件
# COPY apps/frontend/react-webpack/nginx.conf /etc/nginx/conf.d/default.conf
# 暴露Nginx的默认端口
EXPOSE 80