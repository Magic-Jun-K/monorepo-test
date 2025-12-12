// PipeTransform
import { PipeTransform, Logger } from '@nestjs/common';

/**
 * nest 做的是规范约定的事情
 */
export class DetailPipe implements PipeTransform {
  private readonly logger = new Logger(DetailPipe.name);

  transform(value: unknown) {
    this.logger.log('DetailPipe', value);
    return value + '测试自定义管道';
  }
}
