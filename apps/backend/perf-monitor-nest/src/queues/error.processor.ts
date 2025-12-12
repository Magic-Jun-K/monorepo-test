import { InjectQueue, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bullmq';

import { ErrorLogService } from '../modules/error-log/error-log.service';

// Define expected error data structure
interface ErrorLogEntry {
  errorMessage?: string;
  stackTrace?: string;
  projectId?: string;
  url?: string;
  userAgent?: Record<string, unknown>;
  ip?: string;
  errorData?: {
    message: string;
    stack: string;
    type: 'js_error' | 'resource_error' | 'promise_rejection';
    context?: Record<string, unknown>;
    device?: Record<string, unknown>;
  } | null;
  tags?: string[];
  [key: string]: unknown; // Fallback for unknown properties
}

@Processor('error')
export class ErrorProcessor {
  constructor(
    @InjectQueue('error') private errorQueue: Queue,
    private errorLogService: ErrorLogService,
  ) {}

  async process(job: Job<ErrorLogEntry[]>) {
    const transformed = job.data.map((entry) => ({
      message: entry.errorMessage ?? '',
      stack: entry.stackTrace ?? '',
      timestamp: new Date(),
      projectId: entry.projectId ?? '',
      url: entry.url ?? '',
      userAgent: entry.userAgent ?? {},
      ip: entry.ip ?? '',
      errorData: entry.errorData ?? undefined, // 改为 undefined 而不是 null
      tags: Array.isArray(entry.tags) ? entry.tags : [],
    }));
    await this.errorLogService.bulkInsert(transformed);
  }
}
