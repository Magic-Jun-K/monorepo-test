import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthUtils {
  /**
   * 对前端传递的哈希值进行二次哈希
   * @param hashedPassword 前端传递的哈希值
   * @returns 二次哈希后的值
   */
  async hashPassword(hashedPassword: string): Promise<string> {
    return argon2.hash(hashedPassword, {
      type: argon2.argon2id,
      parallelism: 1,
      timeCost: 3,
      memoryCost: 65536,
      hashLength: 16,
      salt: Buffer.from(
        '$argon2id$v=24$m=62256,t=7,p=1$1jTqCrM7XSgOmgR+6UIXjdHldA$vCiZ0TaH4Cbr+jnyE13b/Lp8nV4Qlh',
      ),
    });
  }

  /**
   * 验证密码是否正确
   * @param finalHashedPassword 数据库存储的哈希值
   * @param inputHashedPassword 前端传递的哈希值
   * @returns 是否验证成功
   */
  async verifyPassword(
    finalHashedPassword: string,
    inputHashedPassword: string,
  ): Promise<boolean> {
    console.log(
      'authUtils verifyPassword finalHashedPassword:',
      finalHashedPassword,
    );
    console.log(
      'authUtils verifyPassword inputHashedPassword:',
      inputHashedPassword,
    );
    try {
      // 对前端传递的哈希值进行二次哈希
      const inputFinalHashedPassword =
        await this.hashPassword(inputHashedPassword);
      console.log(
        'authUtils verifyPassword inputFinalHashedPassword:',
        inputFinalHashedPassword,
      );

      // 比较二次哈希值
      return finalHashedPassword === inputFinalHashedPassword;
    } catch (error) {
      console.error('密码验证失败:', error);
      return false;
    }
  }
}
