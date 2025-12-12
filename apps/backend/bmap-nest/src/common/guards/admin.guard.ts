/**
 * 管理员权限守卫
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    return user.userType === 'admin';
  }
}

/**
 * 超级管理员权限守卫
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // 检查是否为管理员且用户名匹配超级管理员配置
    return user.userType === 'admin' && user.username === process.env.SUPER_ADMIN_USERNAME;
  }
}

/**
 * 权限守卫工厂
 */
export const requirePermission = (_permission: string) => {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 保存原始方法
    const originalMethod = descriptor.value;

    // 这里可以添加更细粒度的权限控制逻辑
    descriptor.value = function (...args: unknown[]) {
      const request = args.find(
        (arg: unknown) => arg && typeof arg === 'object' && 'user' in (arg as object),
      ) as { user: unknown } | undefined;

      if (!request?.user) {
        throw new Error('未授权访问');
      }

      // 检查用户是否具有所需权限
      const user = request.user;
      if (user && typeof user === 'object' && 'userType' in user && user.userType !== 'admin') {
        throw new Error('需要管理员权限');
      }

      // 调用原始方法
      return originalMethod.apply(this, args);
    };
  };
};
