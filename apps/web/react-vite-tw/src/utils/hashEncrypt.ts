import {
  // hashPassword,
  encryptWithKeyExchange,
  generateDeviceFingerprint,
} from '@eggshell/shared-crypto/web';

let serverPublicKey: string | null = null;

/**
 * 初始化认证，获取服务器公钥
 */
export async function initAuth() {
  const response = await fetch('/api/auth/public-key');
  const { publicKey } = await response.json();
  serverPublicKey = publicKey;
}

/**
 * 加密登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录结果
 */
export async function encryptedLogin(username: string, password: string, isRetry = false) {
  if (!serverPublicKey) {
    await initAuth();
  }

  // 生成设备指纹
  const deviceFingerprint = await generateDeviceFingerprint();
  // // 前端哈希（弱保护）
  // const hashedPassword = await hashPassword(password);

  // 注意：我们移除前端的 hashPassword，因为它包含随机盐，会导致后端无法验证。
  // 安全性说明：
  // 这里的 password 虽然是原始密码，但在下方的 encryptWithKeyExchange 中
  // 会被 AES-256-GCM 算法完全加密。
  // 黑客在网络上截获的只是加密后的乱码，无法获取原始密码。
  // 这相当于在应用层实现了一次 TLS/HTTPS 加密。
  // 后端收到数据后，会先解密，再验证密码（不存储原始密码）。
  // 后端验证密码时，会使用相同的随机盐哈希算法，确保密码验证逻辑与前端一致。

  const loginData = {
    username,
    // passwordHash: hashedPassword.hash,
    passwordHash: password, // 发送原始密码进入加密通道（字段名保持兼容）
    timestamp: Date.now(),
    deviceFingerprint,
    requestId: crypto.randomUUID(),
  };

  // 加密传输
  // 核心安全层：使用 X25519 + AES-256-GCM 对整个 Payload 进行加密
  const encrypted = await encryptWithKeyExchange(JSON.stringify(loginData), serverPublicKey!);

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encrypted),
  });

  const data = await response.json();

  // 自动重试机制：
  // 如果后端重启，密钥对会更新，导致前端持有的旧公钥加密的数据无法解密（报401）。
  // 此时自动清除公钥，重新获取并重试一次。
  if (response.status === 401 && !isRetry) {
    console.log('登录失败(401)可能是密钥过期，尝试刷新公钥并重试...');
    serverPublicKey = null;
    return encryptedLogin(username, password, true);
  }

  return data;
}

/**
 * 加密注册
 * @param username 用户名
 * @param password 密码
 * @returns 注册结果
 */
export async function encryptedRegister(username: string, password: string, isRetry = false) {
  if (!serverPublicKey) {
    await initAuth();
  }

  // 移除随机盐哈希，直接加密传输原始密码
  // const hashedPassword = await hashPassword(password);

  const registerData = {
    username,
    // passwordHash: hashedPassword.hash,
    passwordHash: password, // 发送原始密码
    timestamp: Date.now(),
    requestId: crypto.randomUUID(),
  };

  const encrypted = await encryptWithKeyExchange(JSON.stringify(registerData), serverPublicKey!);

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encrypted),
  });

  const data = await response.json();

  if (response.status === 401 && !isRetry) {
    console.log('注册失败(401)，尝试刷新公钥并重试...');
    serverPublicKey = null;
    return encryptedRegister(username, password, true);
  }

  return data;
}
