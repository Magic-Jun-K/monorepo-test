import { SecureDataPacket } from '../types';

/**
 * 生成请求 ID
 * @returns 请求 ID 字符串
 */
export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * 创建安全的数据包
 * @param data 要封装的数据
 * @returns 安全数据包对象
 */
export function createSecureDataPacket<T>(
  data: T,
  // _options?: {
  //   signWith?: string;
  //   encryptWith?: string;
  // },
): SecureDataPacket<T> {
  const packet: SecureDataPacket<T> = {
    data,
    timestamp: Date.now(),
    requestId: generateRequestId(),
  };

  return packet;
}

/**
 * 验证时间戳（防重放攻击）
 * @param timestamp 时间戳（毫秒）
 * @param maxAgeMs 最大允许时间差（毫秒）
 * @returns 是否有效
 */
export function validateTimestamp(
  timestamp: number,
  maxAgeMs: number = 5 * 60 * 1000, // 5分钟
): boolean {
  const now = Date.now();
  return Math.abs(now - timestamp) <= maxAgeMs;
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    // 降级方案（不安全，仅用于测试）
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i]! % chars.length];
  }

  return result;
}

/**
 * Base64 URL 安全编码
 * @param str 要编码的字符串
 * @returns 编码后的字符串
 */
export function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Base64 URL 安全解码
 * @param str 要解码的字符串
 * @returns 解码后的字符串
 */
export function base64UrlDecode(str: string): string {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}
