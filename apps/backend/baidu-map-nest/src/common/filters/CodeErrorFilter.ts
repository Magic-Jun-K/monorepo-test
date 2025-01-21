/**
 * @description 错误过滤器
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class CodeErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception?.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR;
    
    const response = exception.getResponse?.() || {
      message: exception.message,
      code: status,
      detail: '代码异常处理',
    };

    res.status(status).json({
      ...(typeof response === 'object' ? response : { message: response }),
      code: status,
      detail: '代码异常处理',
    });
  }
}
