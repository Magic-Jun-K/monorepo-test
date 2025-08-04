import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    // 创建邮件传输器
    this.transporter = createTransport({
      host: process.env.MAILER_HOST, // 邮箱服务器地址
      port: parseInt(process.env.MAILER_PORT || '465'), // 端口号
      secure: true, // 是否使用安全传输协议（TLS端口设为false，SSL端口设为true）
      auth: {
        user: process.env.MAILER_USER, // 邮箱用户名
        pass: process.env.MAILER_PASS, // 邮箱密码
      },
    });
  }

  /**
   * 发送邮件
   * @param email 收件人邮箱
   * @param subject 邮件主题
   * @param text 邮件内容
   */
  async sendMail(email: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: process.env.MAILER_FROM || 'noreply@example.com',
      to: email,
      subject,
      text,
    });
  }
}
