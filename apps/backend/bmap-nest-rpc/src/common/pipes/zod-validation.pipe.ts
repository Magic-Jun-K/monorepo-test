/**
 * @description 验证管道
 */
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const result = this.schema.parse(value);
      return result;
    } catch (error) {
      throw new BadRequestException('验证失败: ' + error.errors.map(e => e.message).join(', '));
    }
  }
}