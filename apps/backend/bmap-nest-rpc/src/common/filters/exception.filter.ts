/**
 * @description 异常过滤器
 */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse(); // 获取请求上下文中的 response 对象
    const request = ctx.getRequest(); // 获取请求上下文中的 request 对象
    const status = exception.getStatus(); // 获取状态码

    const exceptionRes = exception.getResponse(); // 获取异常响应
    const { error, message } = exceptionRes as { error: string; message: string };

    // let message = exception.message;
    // let detail = '异常处理';

    // Handle authentication errors(处理身份验证错误)
    // if (status === 401) {
    //   const response = exception.getResponse();
    //   if (typeof response === 'object' && response !== null) {
    //     message = response['message'] || '认证失败';
    //     detail = response['error'] || '认证失败';
    //   } else {
    //     message = '无效的凭证';
    //     detail = '认证失败';
    //   }
    // }

    // Set status code before sending response(在发送响应之前设置状态代码)
    response.status(status).json({
      code: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
      // detail,
    });
    // 可以使用logger替代console.log
    // this.logger.log('HttpErrorFilter', {
    //   code: status,
    //   timestamp: new Date().toISOString(),
    //   path: request.url,
    //   error,
    //   message,
    // });
  }
}
