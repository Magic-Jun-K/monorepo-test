import Koa from 'koa';

import imageRoutes from './imageRoutes.ts';
import userRoutes from './userRoutes.ts';
import authRoutes from './authRoutes.ts';
import type { AppState, AppContext } from '@/types/index.ts';

export default function registerRoutes(app: Koa<AppState, AppContext>) {
  // 注册所有路由
  app.use(imageRoutes.routes());
  app.use(imageRoutes.allowedMethods());
  app.use(userRoutes.routes());
  app.use(userRoutes.allowedMethods());
  app.use(authRoutes.routes());
  app.use(authRoutes.allowedMethods());
}
