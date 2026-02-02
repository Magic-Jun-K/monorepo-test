import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * 发送短信验证码
   * @param phoneNumber 手机号
   * @param code 验证码
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    // 这里接入真实的短信服务商 SDK (如阿里云、腾讯云)
    // 目前仅做模拟，在控制台输出
    this.logger.log(`[Mock SMS] Sending code ${code} to ${phoneNumber}`);

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 100));

    // TODO: 替换为真实调用
    // await this.aliyunSmsClient.send(...)
  }
}
