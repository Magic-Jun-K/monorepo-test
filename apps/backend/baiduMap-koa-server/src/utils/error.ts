import { Context} from 'koa';

class ErrorHandler {
  static handleError(ctx: Context, error: any) {
    ctx.status = error.status || 500;
    ctx.body = { message: error.message || 'Internal Server Error' };
  }
}

export default ErrorHandler;
