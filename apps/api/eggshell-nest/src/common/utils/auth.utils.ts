import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

import {
  generateKeyPair,
  decryptWithKeyExchange,
  DecryptedLoginData,
} from '@eggshell/shared-crypto/node';

@Injectable()
export class AuthUtils {
  private readonly logger = new Logger(AuthUtils.name);

  // 服务器密钥对（X25519）
  private static serverKeyPair: { publicKey: string; privateKey: string } | null = null;

  /**
   * 获取服务器X25519公钥
   * @returns 服务器X25519公钥
   */
  async getServerPublicKey(): Promise<string> {
    const { publicKey } = await this.getServerKeyPair();
    return publicKey;
  }

  /**
   * 获取服务器X25519密钥对
   * @returns 服务器X25519密钥对
   */
  async getServerKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    if (AuthUtils.serverKeyPair) {
      return AuthUtils.serverKeyPair;
    }

    const keyPair = await generateKeyPair('X25519');

    AuthUtils.serverKeyPair = {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
    };

    this.logger.log('服务器X25519密钥对生成成功');
    return AuthUtils.serverKeyPair;
  }

  /**
   * 使用密钥交换解密数据
   * @param encryptedData 加密数据
   * @returns 解密后的登录数据
   */
  async decryptWithKeyExchange(encryptedData: {
    encrypted: string;
    clientPublicKey: string;
    nonce: string;
    algorithm: string;
  }): Promise<DecryptedLoginData> {
    const { privateKey } = await this.getServerKeyPair();
    return decryptWithKeyExchange(
      {
        encrypted: encryptedData.encrypted,
        clientPublicKey: encryptedData.clientPublicKey,
        nonce: encryptedData.nonce,
        algorithm: encryptedData.algorithm,
      },
      privateKey,
    );
  }

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
   * 验证前端传来的密码哈希是否与数据库存储的哈希匹配
   * @param databaseHash 数据库存储的argon2哈希
   * @param frontendHash 前端传来的scrypt哈希
   */
  async verifyPasswordHash(databaseHash: string, frontendHash: string): Promise<boolean> {
    try {
      this.logger.log('验证密码哈希...');
      // 使用argon2验证，前端传来的scrypt哈希作为原始密码
      const isValid = await argon2.verify(databaseHash, frontendHash);
      this.logger.log('密码哈希验证结果:', isValid);
      return isValid;
    } catch (error) {
      this.logger.error('密码哈希验证失败:', error);
      return false;
    }
  }
}
