/**
 * @description 服务端项目数据处理、逻辑处理（服务层）
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class DetailService {
  getHello(): string {
    return '测试detail!';
  }
}
