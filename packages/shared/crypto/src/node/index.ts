export { hashPassword, verifyPassword, needsRehash, checkPasswordStrength } from './hash';
export {
  generateKeyPair,
  encryptWithKeyExchange,
  decryptWithKeyExchange,
  signData,
  verifySignature,
} from './crypto';
export {
  generateRandomBytes,
  generateSalt,
  generateRequestId,
  createSecureDataPacket,
} from './utils';

export type {
  HashResult,
  VerificationResult,
  KeyPair,
  EncryptedData,
  DecryptedLoginData,
  SignatureResult,
  SecureDataPacket,
  PasswordHashOptions,
  EncryptionOptions,
  SigningOptions,
  DeviceFingerprint,
  LoginRequest,
  RegistrationRequest,
  SecurityCheckResult,
  RateLimitInfo,
  ARGON2_PRESETS,
  Argon2Preset,
} from '../types';
