// PipeTransform
import { PipeTransform } from '@nestjs/common';

/**
 * nest 做的是规范约定的事情
 */
export class DetailPipe implements PipeTransform {
  transform(value: any) {
    console.log('DetailPipe', value);
    return value + '测试自定义管道';
  }
}
