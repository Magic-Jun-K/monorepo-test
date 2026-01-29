import { KeyPair, EncryptedData, SignatureResult } from '../types';

/**
 * 生成密钥对（浏览器端）
 * @param algorithm 算法名称（Ed25519、X25519）
 * @returns 密钥对对象
 */
export async function generateKeyPair(
  algorithm: 'X25519' | 'Ed25519' = 'Ed25519',
): Promise<KeyPair> {
  try {
    let keyPair: CryptoKeyPair;
    let keyAlgorithm: string;

    switch (algorithm) {
      case 'Ed25519':
        keyPair = await crypto.subtle.generateKey(
          {
            name: 'Ed25519',
            namedCurve: 'Ed25519',
          },
          true,
          ['sign', 'verify'],
        );
        keyAlgorithm = 'Ed25519';
        break;

      case 'X25519':
        keyPair = await crypto.subtle.generateKey(
          {
            name: 'X25519',
            namedCurve: 'X25519',
          },
          true,
          ['deriveKey', 'deriveBits'],
        );
        keyAlgorithm = 'X25519';
        break;

      default:
        throw new Error(`不支持的算法: ${algorithm}`);
    }

    // 导出公钥
    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);

    // 导出私钥
    const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
      privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey))),
      algorithm: keyAlgorithm,
      keySize: 256,
    };
  } catch (error) {
    console.error('生成密钥对失败:', error);
    throw error;
  }
}

/**
 * 使用密钥交换加密数据（X25519 + AES-GCM）
 * @param data 原始数据
 * @param serverPublicKey 服务器公钥字符串（Base64编码）
 * @param algorithm 算法名称（X25519）
 * @returns 加密后的数据对象
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
    const nonce = crypto.getRandomValues(new Uint8Array(12));

    // 5. 加密数据
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
        tagLength: 128,
      },
      sharedSecret,
      encoder.encode(data),
    );

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      clientPublicKey: clientKeyPair.publicKey,
      nonce: btoa(String.fromCharCode(...nonce)),
      algorithm: `${algorithm}+AES-256-GCM`,
    };
  } catch (error) {
    console.error('加密失败:', error);
    throw error;
  }
}

/**
 * 解密数据（浏览器端通常不需要解密，这里提供基础实现）
 * @param encryptedData 加密数据对象
 * @param privateKey 私钥字符串（Base64编码）
 * @param algorithm 算法名称（X25519）
 * @returns 解密后的原始数据字符串
 */
export async function decryptWithKeyExchange(
  encryptedData: EncryptedData,
  // privateKey: string,
  // algorithm: 'X25519' = 'X25519',
): Promise<string> {
  try {
    // 这里简化实现，实际需要完整的解密流程
    const encryptedBuffer = Uint8Array.from(atob(encryptedData.encrypted), (c) => c.charCodeAt(0));
    const decoder = new TextDecoder();
    return decoder.decode(encryptedBuffer);
  } catch (error) {
    console.error('解密失败:', error);
    throw error;
  }
}

/**
 * 签名数据
 * @param data 原始数据
 * @param privateKey 私钥字符串（Base64编码）
 * @param algorithm 算法名称（Ed25519、X25519）
 * @returns 签名结果对象
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
      signature = await crypto.subtle.sign({ name: 'Ed25519' }, key, encoder.encode(data));
    } else {
      throw new Error(`不支持的签名算法: ${algorithm}`);
    }

    return {
      signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
      algorithm,
    };
  } catch (error) {
    console.error('签名失败:', error);
    throw error;
  }
}

/**
 * 验证签名
 * @param data 原始数据
 * @param signature 签名字符串（Base64编码）
 * @param publicKey 公钥字符串（Base64编码）
 * @param algorithm 算法名称（Ed25519、X25519）
 * @returns 是否验证成功
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
    const signatureBuffer = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));

    if (algorithm === 'Ed25519') {
      return crypto.subtle.verify({ name: 'Ed25519' }, key, signatureBuffer, encoder.encode(data));
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

/**
 * 导入公钥
 * @param keyString 公钥字符串（Base64编码）
 * @param algorithm 算法名称（Ed25519、X25519）
 * @returns 导入的 CryptoKey 对象
 */
async function importPublicKey(keyString: string, algorithm: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));

  let algorithmParams: AlgorithmIdentifier | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm;
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

  return crypto.subtle.importKey(
    'spki',
    keyData,
    algorithmParams,
    true,
    algorithm === 'Ed25519' ? (['verify'] as const) : [],
  );
}

/**
 * 导入私钥
 * @param keyString 私钥字符串（Base64编码）
 * @param algorithm 算法名称（Ed25519、X25519）
 * @returns 导入的 CryptoKey 对象
 */
async function importPrivateKey(keyString: string, algorithm: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));

  let algorithmParams: AlgorithmIdentifier | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm;
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

  return crypto.subtle.importKey(
    'pkcs8',
    keyData,
    algorithmParams,
    true,
    algorithm === 'Ed25519' ? (['sign'] as const) : (['deriveKey', 'deriveBits'] as const),
  );
}

/**
 * 派生共享密钥
 * @param privateKeyString 私钥字符串（Base64编码）
 * @param publicKey 公钥 CryptoKey 对象
 * @param algorithm 算法名称（Ed25519、X25519）
 * @returns 派生的共享密钥 CryptoKey 对象
 */
async function deriveSharedSecret(
  privateKeyString: string,
  publicKey: CryptoKey,
  algorithm: string,
): Promise<CryptoKey> {
  const privateKey = await importPrivateKey(privateKeyString, algorithm);

  return crypto.subtle.deriveKey(
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
