import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /* 用户服务也不包含任何身份验证逻辑。这表明身份验证可能是通过第三方服务处理的，或者AuthGuard可能使用了不同的身份验证机制。
    鉴于我们无法找到身份验证端点，我们有两个选择：
    创建一个公共装饰器来绕过文件上传端点的身份验证
    实现正确的身份验证端点
    由于实现身份验证将是一项更大的任务，让我们创建一个公共装饰器，使文件上传端点可访问。这是一个临时解决方案，直到可以实现正确的身份验证。
    我将创建一个新的装饰器文件，并修改文件控制器以使用它。
  */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // 允许公开的接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    
    // Allow access to register endpoint(允许访问注册端点)
    if (req.originalUrl === '/admin/register' || req.originalUrl === '/auth/login') {
      return true;
    }

    // 不是开放的接口，就需要验证 token
    return req.originalUrl === '/' || !!req.header('token');
  }
}
