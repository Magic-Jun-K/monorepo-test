/**
 * 生成随机字节字符串（Base64编码）
 * @param length 字节长度
 * @returns 随机字节字符串
 */
export function generateRandomBytes(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return btoa(String.fromCharCode(...bytes));
}

/**
 * 生成安全盐（Base64编码）
 * @param length 字节长度
 * @returns 安全盐字符串
 */
export function generateSalt(length: number = 32): string {
  return generateRandomBytes(length);
}

// 从共享工具重新导出
export { generateRequestId, createSecureDataPacket } from '../shared/utils';
