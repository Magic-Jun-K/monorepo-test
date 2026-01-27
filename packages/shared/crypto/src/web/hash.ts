import { HashResult, VerificationResult } from '../types';

/**
 * 浏览器端密码哈希（弱保护，仅用于传输）
 * 实际强哈希应在后端完成
 * @param password 原始密码
 * @returns 哈希结果对象
 */
export async function hashPassword(
  password: string,
  // preset: string = 'INTERACTIVE',
): Promise<HashResult> {
  // 浏览器端不使用 argon2（太重），使用 SHA-256
  const encoder = new TextEncoder();

  // 生成随机盐
  const saltBuffer = new Uint8Array(32);
  crypto.getRandomValues(saltBuffer);
  const salt = btoa(String.fromCharCode(...saltBuffer));

  // 添加盐到密码
  const saltedPassword = password + salt;
  const saltedData = encoder.encode(saltedPassword);

  // 计算哈希
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData);
  const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  return {
    hash,
    salt,
    params: {
      type: 'SHA-256',
      memoryCost: 0,
      timeCost: 1,
      parallelism: 1,
    },
    version: 1,
  };
}

/**
 * 验证密码（浏览器端）
 * @param password 原始密码
 * @param hash 哈希字符串（包含盐）
 * @returns 验证结果对象
 */
export async function verifyPassword(password: string, hash: string): Promise<VerificationResult> {
  const start = Date.now();

  // 从哈希字符串中提取盐（如果存在的话）
  // 注意：这里简化了，实际应用中盐应该分开存储
  const saltMatch = hash.match(/^([^$]+)\$(.+)$/);

  let isValid = false;
  if (saltMatch) {
    const [, extractedHash, salt] = saltMatch;
    const newHash = await hashPassword(password + salt);
    isValid = newHash.hash === extractedHash;
  } else {
    // 如果没有盐，直接比较
    const newHash = await hashPassword(password);
    isValid = newHash.hash === hash;
  }

  const end = Date.now();

  return {
    isValid,
    timingSafe: false, // 浏览器端难以保证时序安全
    verificationTimeMs: end - start,
  };
}

/**
 * 检查密码强度（浏览器端）
 * @param password 原始密码
 * @returns 强度检查结果对象
 */
export function checkPasswordStrength(password: string): {
  score: number; // 0-4
  feedback: string[];
  meetsRequirements: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  // 长度检查 (>=12)
  if (password.length >= 12) {
    score += 1;
  } else {
    feedback.push('密码至少需要12个字符');
  }

  // 大小写字母
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('需要同时包含大写和小写字母');
  }

  // 数字
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('需要包含数字');
  }

  // 特殊字符
  if (/[@#$%^&*()_+=[]{};':"|,.\/<>?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('需要包含特殊字符（如!@#$%）');
  }

  // 检查常见密码
  const commonPasswords = [
    'password',
    '123456',
    'qwerty',
    'admin',
    'welcome',
    'password123',
    'qwerty123',
    'admin123',
    'letmein',
    'monkey',
    '12345678',
    '123456789',
    '12345',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('密码过于常见，请选择更复杂的密码');
  }

  return {
    score,
    feedback,
    meetsRequirements: score >= 3,
  };
}

/**
 * 生成设备指纹
 * 基于用户代理、语言、屏幕分辨率、时区、平台、内存、硬件并发数和时区
 * 用于客户端登录验证，防止中间人攻击
 * 建议在服务器端验证设备指纹
 * 服务器端可以使用相同的算法生成指纹，然后与客户端指纹比较
 * 注意：这不是绝对安全的，因为可以被修改
 * @returns 设备指纹字符串（Base64编码）
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
      (navigator as Navigator & { platform?: string }).platform ||
      'unknown',
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 'unknown',
    navigator.hardwareConcurrency,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');

  // 使用 Web Crypto API 计算哈希
  const encoder = new TextEncoder();
  const data = encoder.encode(components);

  return crypto.subtle
    .digest('SHA-256', data)
    .then((hash) => {
      const hashArray = [...new Uint8Array(hash)];
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    })
    .catch(() => {
      // 降级方案
      let hash = 0;
      for (let i = 0; i < components.length; i++) {
        const char = components.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    });
}
