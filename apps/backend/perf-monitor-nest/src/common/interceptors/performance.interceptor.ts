/**
 * @description 性能监控拦截器
 */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Request, Response } from 'express';

import { MonitoringService } from '../monitoring/monitoring.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly monitoringService: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const status = context.switchToHttp().getResponse<Response>().statusCode;
        // 添加实际监控逻辑
        this.monitoringService.recordApiLatency({
          method: request.method,
          path: request.url,
          duration,
          status,
        });
      }),
      catchError((err: Error) => {
        const duration = Date.now() - start;
        const status =
          typeof err === 'object' &&
          err !== null &&
          'status' in err &&
          typeof err.status === 'number'
            ? err.status
            : 500;
        this.monitoringService.recordApiError({
          method: request.method,
          path: request.url,
          duration,
          status,
        });
        return throwError(() => err);
      }),
    );
  }
}
