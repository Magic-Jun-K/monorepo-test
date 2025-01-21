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
    const res = ctx.getResponse();
    const status = exception?.getStatus?.(); // 获取状态码
    
    let message = exception.message;
    let detail = '异常处理';
    
    // Handle authentication errors(处理身份验证错误)
    if (status === 401) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        message = response['message'] || '认证失败';
        detail = response['error'] || '认证失败';
      } else {
        message = '无效的凭证';
        detail = '认证失败';
      }
    }

    // Set status code before sending response(在发送响应之前设置状态代码)
    res.status(status).json({
      message,
      code: status,
      detail,
    });
    console.log('HttpErrorFilter', { 
      status, 
      message,
      response: { message, code: status, detail }
    });
  }
}
