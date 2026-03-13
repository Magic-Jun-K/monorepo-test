/**
 * @description 性能监控拦截器
 */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { FastifyRequest, FastifyReply } from 'fastify';

import { MonitoringService } from '../monitoring/monitoring.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly monitoringService: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const status = context.switchToHttp().getResponse<FastifyReply>().statusCode;
        this.monitoringService.recordApiLatency({
          method: request.method ?? 'UNKNOWN',
          path: request.url ?? 'UNKNOWN',
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
          method: request.method ?? 'UNKNOWN',
          path: request.url ?? 'UNKNOWN',
          duration,
          status,
        });
        return throwError(() => err);
      }),
    );
  }
}
