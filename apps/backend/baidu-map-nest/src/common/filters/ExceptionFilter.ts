/**
 * @description 错误过滤器
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    // const req = ctx.getRequest();
    const res = ctx.getResponse();
    const status = exception?.getStatus?.(); // 获取状态码
    res.json({
      message: exception.message,
      code: status,
      detail: '测试异常处理',
    });
    console.log('测试HttpErrorFilter', status);
  }
}
