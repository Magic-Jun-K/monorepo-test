// PipeTransform
import { PipeTransform } from '@nestjs/common';

/**
 * nest 做的是规范约定的事情
 */
export class DetailPipe implements PipeTransform {
  transform(value: unknown) {
    // 移除console.log，可以使用logger替代
    return `${value}测试自定义管道`;
  }
}
