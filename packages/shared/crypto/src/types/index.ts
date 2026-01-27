// ============ 核心加密类型 ============

export interface HashResult {
  hash: string;
  salt: string;
  params: {
    type: string;
    memoryCost: number;
    timeCost: number;
    parallelism: number;
  };
  version: number;
}

export interface VerificationResult {
  isValid: boolean;
  timingSafe: boolean;
  verificationTimeMs: number;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: string;
  keySize: number;
}

export interface EncryptedData {
  encrypted: string;
  clientPublicKey: string;
  nonce: string;
  algorithm: string;
}

export interface DecryptedLoginData {
  username: string;
  passwordHash: string;
  timestamp: number;
  deviceFingerprint?: string;
  requestId: string;
  [key: string]: unknown;
}

export interface SignatureResult {
  signature: string;
  algorithm: string;
}

export interface SecureDataPacket<T = unknown> {
  data: T;
  timestamp: number;
  requestId: string;
  signature?: string;
  nonce?: string;
}

export interface PasswordHashOptions {
  type?: 'argon2id' | 'argon2i' | 'argon2d';
  memoryCost?: number;
  timeCost?: number;
  parallelism?: number;
  saltLength?: number;
}

export interface EncryptionOptions {
  algorithm?: 'X25519';
}

export interface SigningOptions {
  algorithm?: 'Ed25519';
}

// Argon2 预设配置
export const ARGON2_PRESETS = {
  INTERACTIVE: {
    type: 'argon2id' as const,
    memoryCost: 65536, // 64MB
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
  },
  MODERATE: {
    type: 'argon2id' as const,
    memoryCost: 131072, // 128MB
    timeCost: 4,
    parallelism: 4,
    hashLength: 32,
  },
  SENSITIVE: {
    type: 'argon2id' as const,
    memoryCost: 262144, // 256MB
    timeCost: 5,
    parallelism: 4,
    hashLength: 32,
  },
} as const;

export type Argon2Preset = keyof typeof ARGON2_PRESETS;

// ============ 共享认证安全类型 ============

export interface DeviceFingerprint {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  deviceMemory?: string;
  hardwareConcurrency: number;
}

export interface LoginRequest {
  username: string;
  encryptedPassword: string;
  timestamp: number;
  deviceInfo: DeviceFingerprint;
  requestId: string;
}

export interface RegistrationRequest {
  username: string;
  passwordHash: string; // 前端哈希
  userData: unknown;
  timestamp: number;
  deviceInfo: DeviceFingerprint;
}

export interface SecurityCheckResult {
  isSuspicious: boolean;
  reasons: string[];
  riskScore: number;
}

export interface RateLimitInfo {
  key: string;
  attempts: number;
  expiresAt: number;
  isBlocked: boolean;
}
