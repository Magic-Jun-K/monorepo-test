import { Injectable, Logger } from '@nestjs/common';

import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { SmsService } from './sms.service';

export type VerificationType = 'email' | 'sms';

@Injectable()
export class VerificationCodeService {
  private readonly logger = new Logger(VerificationCodeService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * 发送验证码
   * @param target 目标 (邮箱或手机号)
   * @param type 类型
   */
  async sendCode(target: string, type: VerificationType = 'email'): Promise<void> {
    // 生成6位随机数
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `verify_code:${type}:${target}`;

    // 缓存验证码到redis (5分钟有效)
    await this.redisService.set(key, code, 300);

    if (type === 'email') {
      await this.mailService.sendMail(target, '验证码', `您的验证码是：${code}，有效期5分钟。`);
      this.logger.log(`Email verification code sent to ${target}`);
    } else if (type === 'sms') {
      await this.smsService.sendVerificationCode(target, code);
      this.logger.log(`SMS verification code sent to ${target}: ${code}`);
    }
  }

  /**
   * 验证验证码
   * @param target 目标
   * @param code 验证码
   * @param type 类型
   * @returns 是否验证成功
   */
  async verifyCode(
    target: string,
    code: string,
    type: VerificationType = 'email',
  ): Promise<boolean> {
    const key = `verify_code:${type}:${target}`;
    const storedCode = await this.redisService.get(key);

    if (!storedCode || storedCode !== code) {
      return false;
    }

    // 验证成功后删除验证码，防止重复使用
    await this.redisService.del(key);
    return true;
  }
}
