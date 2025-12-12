import * as argon2 from 'argon2';
import { Injectable, Logger } from '@nestjs/common';
import { jwtDecrypt, importPKCS8 } from 'jose';

@Injectable()
export class AuthUtils {
  private readonly logger = new Logger(AuthUtils.name);
  /**
   * 对前端传递的哈希值进行哈希处理
   * @param hashedPassword 前端传递的哈希值
   * @returns 哈希后的值
   */
  async hashPassword(hashedPassword: string): Promise<string> {
    return argon2.hash(hashedPassword, {
      type: argon2.argon2id,
      parallelism: 1, // 并行度
      timeCost: 3, // 耗时
      memoryCost: 65536, // 内存消耗
      hashLength: 16, // 输出长度
    });
  }

  /**
   * RSA解密密码
   * @param encryptedPassword 前端传递的RSA加密密码
   * @returns 解密后的密码
   */
  async decryptRSA(encryptedPassword: string): Promise<string> {
    try {
      this.logger.log('开始RSA解密...');

      // 从环境变量获取RSA私钥
      const privateKey = process.env.RSA_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('RSA_PRIVATE_KEY not found in environment variables');
      }

      // 导入私钥
      const key = await importPKCS8(privateKey.trim(), 'RSA-OAEP');

      // 解密JWE
      const { payload } = await jwtDecrypt(encryptedPassword, key);

      this.logger.log('RSA解密成功');

      // 返回解密后的密码，更安全的类型断言
      return (payload as { password: string }).password;
    } catch (error) {
      this.logger.error('RSA解密失败:', error);
      throw new Error(`Failed to decrypt RSA password: ${error.message || error}`);
    }
  }

  /**
   * 验证密码是否正确
   * @param finalHashedPassword 数据库存储的哈希值
   * @param inputEncryptPassword 前端传递的RSA加密密码
   * @returns 是否验证成功
   */
  async verifyPassword(
    finalHashedPassword: string,
    inputEncryptPassword: string,
  ): Promise<boolean> {
    this.logger.log('authUtils verifyPassword finalHashedPassword:', finalHashedPassword);
    this.logger.log('authUtils verifyPassword inputEncryptPassword:', inputEncryptPassword);
    try {
      let passwordToVerify = inputEncryptPassword;

      // 检查是否是JWT格式的RSA加密密码
      if (inputEncryptPassword.includes('.') && inputEncryptPassword.length > 100) {
        this.logger.log('检测到RSA加密密码，开始解密...');
        passwordToVerify = await this.decryptRSA(inputEncryptPassword);
        this.logger.log('RSA解密后的密码:', passwordToVerify);
      }

      // 使用argon2验证密码
      const isValid = await argon2.verify(finalHashedPassword, passwordToVerify);
      this.logger.log('authUtils verifyPassword isValid:', isValid);

      return isValid;
    } catch (error) {
      this.logger.error('密码验证失败:', error);
      return false;
    }
  }
}
