import { Module } from '@nestjs/common';

import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService], // 导出服务供其他模块使用
})
export class MailModule {}
