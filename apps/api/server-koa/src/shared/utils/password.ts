import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SALT_LENGTH = 16; // 盐值长度
const KEY_LENGTH = 32; // 哈希后的密码长度
const N = 16384; // 迭代次数
const R = 8; // 块大小
const P = 1; // 并行度

/**
 * 哈希密码
 * @param password 密码
 * @returns 哈希后的密码和盐值
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = scryptSync(password, salt, KEY_LENGTH, {
    N,
    r: R,
    p: P,
  });

  return {
    hash: derivedKey.toString('base64'),
    salt: salt.toString('base64'),
  };
}

/**
 * 验证密码
 * @param password 密码
 * @param hash 哈希后的密码
 * @param salt 盐值
 * @returns 是否验证通过
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const saltBuffer = Buffer.from(salt, 'base64');
  const hashBuffer = Buffer.from(hash, 'base64');
  const derivedKey = scryptSync(password, saltBuffer, KEY_LENGTH, {
    N,
    r: R,
    p: P,
  });

  try {
    return timingSafeEqual(hashBuffer, derivedKey);
  } catch {
    return false;
  }
}
