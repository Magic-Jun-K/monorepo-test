/**
 * @description 验证管道
 */
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodObject, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject) {}

  transform(value: unknown) {
    try {
      const result = this.schema.parse(value);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => {
          return `${err.path.join('.')}: ${err.message}`;
        });

        throw new BadRequestException({
          message: '数据验证失败',
          errors: errorMessages,
          success: false,
        });
      }

      throw new BadRequestException({
        message: '验证失败',
        error: error.message,
        success: false,
      });
    }
  }
}
