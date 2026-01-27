/// <reference types="node" />
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

import { HashResult, VerificationResult, ARGON2_PRESETS, Argon2Preset } from '../types';

/**
 * 使用 argon2 哈希密码（Node.js 专用）
 */
export async function hashPassword(
  password: string,
  preset: Argon2Preset = 'INTERACTIVE',
): Promise<HashResult> {
  if (!argon2) {
    throw new Error('Argon2 is only available in Node.js environment');
  }

  const config = ARGON2_PRESETS[preset];
  const salt = randomBytes(32);

  try {
    const hash = await argon2.hash(password, {
      type: argon2[config.type],
      memoryCost: config.memoryCost,
      timeCost: config.timeCost,
      parallelism: config.parallelism,
      salt,
      hashLength: config.hashLength,
    });

    return {
      hash,
      salt: salt.toString('base64'),
      params: {
        type: config.type,
        memoryCost: config.memoryCost,
        timeCost: config.timeCost,
        parallelism: config.parallelism,
      },
      version: 19,
    };
  } catch (error) {
    throw new Error(`Password hashing failed: ${(error as Error).message}`);
  }
}

/**
 * 验证密码（抗时序攻击）
 */
export async function verifyPassword(password: string, hash: string): Promise<VerificationResult> {
  if (!argon2) {
    throw new Error('Argon2 is only available in Node.js environment');
  }

  const start = Date.now();

  try {
    const isValid = await argon2.verify(hash, password);
    const end = Date.now();

    return {
      isValid,
      timingSafe: true,
      verificationTimeMs: end - start,
    };
  } catch {
    // 验证失败时执行假验证以保持时间恒定
    await argon2.hash('dummy-password', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 1,
      parallelism: 1,
    });

    const end = Date.now();

    return {
      isValid: false,
      timingSafe: true,
      verificationTimeMs: end - start,
    };
  }
}

/**
 * 检查是否需要重新哈希
 */
export function needsRehash(hash: string, expectedPreset: Argon2Preset = 'INTERACTIVE'): boolean {
  if (!argon2) {
    return false;
  }

  const currentConfig = ARGON2_PRESETS[expectedPreset];

  // 从哈希中提取参数
  const hashParts = hash.split('$');
  if (hashParts.length < 4) return true;

  // 解析 argon2 参数
  const params = hashParts[3];
  if (!params) return true;
  const m = params.match(/m=(\d+),t=(\d+),p=(\d+)/);

  if (!m) return true;

  const [, mStr, tStr, pStr] = m;
  const currentMemory = Number.parseInt(mStr!, 10);
  const currentTime = Number.parseInt(tStr!, 10);
  const currentParallelism = Number.parseInt(pStr!, 10);

  // 检查是否需要升级
  return (
    currentMemory < currentConfig.memoryCost ||
    currentTime < currentConfig.timeCost ||
    currentParallelism < currentConfig.parallelism
  );
}

/**
 * 检查密码强度
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  meetsRequirements: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@#$%^&*()_+=[]{};':"|,.\/<>?]/.test(password)) score += 1;

  const commonPasswords = [
    'password',
    '123456',
    'qwerty',
    'admin',
    'welcome',
    'password123',
    'qwerty123',
    'admin123',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('密码过于常见');
  }

  return {
    score,
    feedback,
    meetsRequirements: score >= 3,
  };
}
