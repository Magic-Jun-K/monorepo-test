import { StateStorage } from 'zustand/middleware';

import { generateDeviceFingerprint } from '@eggshell/shared-crypto/web';

const SALT = 'EggShell_Secure_Salt_v2'; // Fixed salt for key derivation

let cachedKey: CryptoKey | null = null;

/**
 * 基于设备指纹动态派生 AES-GCM 密钥
 * @returns
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const fingerprint = await generateDeviceFingerprint();
  // Combine fingerprint with salt to create high-entropy source
  const secret = fingerprint + SALT;
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  cachedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  return cachedKey;
}

/**
 * IndexedDB 简单封装
 */
const DB_NAME = 'EggShell_Secure_DB';
const STORE_NAME = 'secure_store';
const DB_VERSION = 1;

interface SecureStorageRecord {
  iv: ArrayBuffer;
  content: ArrayBuffer;
  timestamp?: number;
}

/**
 * 打开 IndexedDB 数据库
 * @returns
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.addEventListener('error', () => reject(request.error));
    request.addEventListener('success', () => resolve(request.result));
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * 从 IndexedDB 中获取加密数据
 * @param key 存储的键名
 * @returns 解密后的原始数据
 */
async function dbGet(key: string): Promise<SecureStorageRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.addEventListener('error', () => reject(request.error));
    request.addEventListener('success', () => resolve(request.result ?? null));
  });
}

/**
 * 向 IndexedDB 存储加密数据
 * @param key 存储的键名
 * @param value 要存储的原始数据
 * @returns
 */
async function dbSet(key: string, value: SecureStorageRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.addEventListener('error', () => reject(request.error));
    request.addEventListener('success', () => resolve());
  });
}

/**
 * 从 IndexedDB 中删除加密数据
 * @param key 存储的键名
 * @returns
 */
async function dbRemove(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.addEventListener('error', () => reject(request.error));
    request.addEventListener('success', () => resolve());
  });
}

/**
 * 安全存储实现
 * 基于 IndexedDB 封装，使用 AES-GCM (Web Crypto API) 加密存储敏感数据
 * 密钥由设备指纹动态派生，无法跨设备解密
 */
export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const record = await dbGet(name); // 从 IndexedDB 获取加密记录
    if (!record) return null;

    try {
      // IndexedDB 可以直接存储对象和二进制数据
      if (!record.iv || !record.content) {
        return null;
      }

      const key = await getEncryptionKey();
      const iv = record.iv;
      const ciphertext = record.content;

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext,
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch {
      console.warn('Failed to decrypt storage item from IndexedDB:', name);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const encodedValue = encoder.encode(value);

    // Generate random IV for each encryption
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedValue,
    );

    // 直接存储二进制数据到 IndexedDB
    const data = {
      iv: iv.buffer,
      content: encryptedBuffer,
      timestamp: Date.now(), // 可选：添加元数据
    };

    await dbSet(name, data);
  },

  removeItem: async (name: string): Promise<void> => {
    await dbRemove(name);
  },
};
