import { webcrypto } from 'node:crypto';

import { KeyPair, EncryptedData, SignatureResult, DecryptedLoginData } from '../types';

/**
 * 生成密钥对（Node.js 端）
 */
export async function generateKeyPair(
  algorithm: 'X25519' | 'Ed25519' = 'Ed25519',
  // options?: { modulusLength?: number },
): Promise<KeyPair> {
  try {
    let keyPair: webcrypto.CryptoKeyPair;
    let keyAlgorithm: string;

    switch (algorithm) {
      case 'Ed25519':
      case 'X25519':
        keyPair = await webcrypto.subtle.generateKey(
          {
            name: algorithm,
            namedCurve: algorithm,
          },
          true,
          algorithm === 'Ed25519' ? ['sign', 'verify'] : ['deriveKey', 'deriveBits'],
        );
        keyAlgorithm = algorithm;
        break;

      default:
        throw new Error(`不支持的算法: ${algorithm}`);
    }

    // 导出公钥
    const publicKey = await webcrypto.subtle.exportKey('spki', keyPair.publicKey);

    // 导出私钥
    const privateKey = await webcrypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: Buffer.from(publicKey).toString('base64'),
      privateKey: Buffer.from(privateKey).toString('base64'),
      algorithm: keyAlgorithm,
      keySize: 256,
    };
  } catch (error) {
    console.error('生成密钥对失败:', error);
    throw error;
  }
}

/**
 * 使用密钥交换加密数据（前端用）
 */
export async function encryptWithKeyExchange(
  data: string,
  serverPublicKey: string,
  algorithm: 'X25519' | 'Ed25519' = 'X25519',
): Promise<EncryptedData> {
  try {
    // 1. 生成临时客户端密钥对
    const clientKeyPair = await generateKeyPair(algorithm);

    // 2. 导入服务器公钥
    const serverKey = await importPublicKey(serverPublicKey, algorithm);

    // 3. 计算共享密钥
    const sharedSecret = await deriveSharedSecret(clientKeyPair.privateKey, serverKey, algorithm);

    // 4. 生成随机 nonce
    const nonce = webcrypto.getRandomValues(new Uint8Array(12));

    // 5. 加密数据
    const encoder = new TextEncoder();
    
    const encrypted = await webcrypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
        tagLength: 128,
      },
      sharedSecret,
      encoder.encode(data),
    );

    return {
      encrypted: Buffer.from(encrypted).toString('base64'),
      clientPublicKey: clientKeyPair.publicKey,
      nonce: Buffer.from(nonce).toString('base64'),
      algorithm: `${algorithm}+AES-256-GCM`,
    };
  } catch (error) {
    console.error('加密失败:', error);
    throw error;
  }
}

/**
 * 使用密钥交换解密数据（后端用）
 */
export async function decryptWithKeyExchange(
  encryptedData: EncryptedData,
  privateKey: string,
  // algorithm: 'X25519' = 'X25519',
): Promise<DecryptedLoginData> {
  try {
    const clientPublicKeyData = Buffer.from(encryptedData.clientPublicKey, 'base64');
    const clientKey = await webcrypto.subtle.importKey(
      'spki',
      clientPublicKeyData,
      { name: 'X25519' },
      true,
      [],
    );

    const serverPrivateKeyData = Buffer.from(privateKey, 'base64');
    const serverKey = await webcrypto.subtle.importKey(
      'pkcs8',
      serverPrivateKeyData,
      { name: 'X25519' },
      true,
      ['deriveKey'],
    );

    const sharedKey = await webcrypto.subtle.deriveKey(
      {
        name: 'X25519',
        public: clientKey,
      },
      serverKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['decrypt'],
    );

    const encryptedBuffer = Buffer.from(encryptedData.encrypted, 'base64');
    const nonceBuffer = Buffer.from(encryptedData.nonce, 'base64');

    const decryptedBuffer = await webcrypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonceBuffer,
        tagLength: 128,
      },
      sharedKey,
      encryptedBuffer,
    );

    const decryptedString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('解密失败:', error);
    throw error;
  }
}

/**
 * 解密数据
 */
export async function signData(
  data: string,
  privateKey: string,
  algorithm: 'Ed25519' = 'Ed25519',
): Promise<SignatureResult> {
  try {
    const key = await importPrivateKey(privateKey, algorithm);
    const encoder = new TextEncoder();

    let signature: ArrayBuffer;
    if (algorithm === 'Ed25519') {
      signature = await webcrypto.subtle.sign({ name: 'Ed25519' }, key, encoder.encode(data));
    } else {
      throw new Error(`不支持的签名算法: ${algorithm}`);
    }

    return {
      signature: Buffer.from(signature).toString('base64'),
      algorithm,
    };
  } catch (error) {
    console.error('签名失败:', error);
    throw error;
  }
}

/**
 * 签名数据
 */
export async function verifySignature(
  data: string,
  signature: string,
  publicKey: string,
  algorithm: 'Ed25519' = 'Ed25519',
): Promise<boolean> {
  try {
    const key = await importPublicKey(publicKey, algorithm);
    const encoder = new TextEncoder();
    const signatureBuffer = Buffer.from(signature, 'base64');

    if (algorithm === 'Ed25519') {
      return webcrypto.subtle.verify(
        { name: 'Ed25519' },
        key,
        signatureBuffer,
        encoder.encode(data),
      );
    }
    
    return false;
  } catch (error) {
    console.error('验证签名失败:', error);
    return false;
  }
}

// ======================
// 辅助函数
// ======================

async function importPublicKey(keyString: string, algorithm: string): Promise<webcrypto.CryptoKey> {
  const keyData = Buffer.from(keyString, 'base64');

  let algorithmParams:
    | webcrypto.AlgorithmIdentifier
    | webcrypto.RsaHashedImportParams
    | webcrypto.EcKeyImportParams
    | webcrypto.HmacImportParams
    | webcrypto.AesKeyAlgorithm;
  switch (algorithm) {
    case 'Ed25519':
      algorithmParams = { name: 'Ed25519' };
      break;
    case 'X25519':
      algorithmParams = { name: 'X25519' };
      break;
    default:
      throw new Error(`不支持的算法: ${algorithm}`);
  }

  return webcrypto.subtle.importKey(
    'spki',
    keyData,
    algorithmParams,
    true,
    algorithm === 'Ed25519' ? (['verify'] as const) : [],
  );
}

async function importPrivateKey(
  keyString: string,
  algorithm: string,
): Promise<webcrypto.CryptoKey> {
  const keyData = Buffer.from(keyString, 'base64');

  let algorithmParams:
    | webcrypto.AlgorithmIdentifier
    | webcrypto.RsaHashedImportParams
    | webcrypto.EcKeyImportParams
    | webcrypto.HmacImportParams
    | webcrypto.AesKeyAlgorithm;
  switch (algorithm) {
    case 'Ed25519':
      algorithmParams = { name: 'Ed25519' };
      break;
    case 'X25519':
      algorithmParams = { name: 'X25519' };
      break;
    default:
      throw new Error(`不支持的算法: ${algorithm}`);
  }

  return webcrypto.subtle.importKey(
    'pkcs8',
    keyData,
    algorithmParams,
    true,
    algorithm === 'Ed25519' ? (['sign'] as const) : (['deriveKey', 'deriveBits'] as const),
  );
}

async function deriveSharedSecret(
  privateKeyString: string,
  publicKey: webcrypto.CryptoKey,
  algorithm: string,
): Promise<webcrypto.CryptoKey> {
  const privateKey = await importPrivateKey(privateKeyString, algorithm);

  return webcrypto.subtle.deriveKey(
    {
      name: 'X25519',
      public: publicKey,
    },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
}
