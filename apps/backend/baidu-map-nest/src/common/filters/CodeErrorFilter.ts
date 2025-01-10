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
export class CodeErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const res = ctx.getResponse();
    const status = exception?.getStatus?.();
    if (!status) {
      res.json({
        message: exception.message,
        code: 500,
        detail: '测试代码异常处理',
      });
    }
  }
}
