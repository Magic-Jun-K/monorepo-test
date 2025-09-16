import { importSPKI, CompactEncrypt } from 'jose';

// RSA 公钥
const RSA_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw7NBtBcMtLlM51WRvSUn
+siXxkKui0q7Q85UiXbsKgZL8RBqehSNQ0xUxSNx4ishVI69LMdlLsJLAd73/T6/
bWOrT9IPuPn2xqgUakxp8+H/LDJgnhXgWTY2G+HDOUcjNPrsuO/+mmFvJ5ZfGdfP
oFR3DP5LgDEJKtDPkkPgw7MJJusbGab3xQahoJPGWaWff4GlZTDawFkekC6lgnGm
DM5WtpGCMnId4BJeL0020/5OBLVmI/q0q9zjWgWcX5PNLMiwB731vFeNnvOf5OTf
DFMkzGGYRbAs3hYtDzamgnTBfM4OX4fQLYwq+2dOTT3BDxISMIXjJgV7ArdV6tDU
HQIDAQAB
-----END PUBLIC KEY-----
`;

// 加密密码
export const encrypt = async (password: string): Promise<string> => {
  try {
    // 使用 RSA 公钥加密密码
    const publicKey = await importSPKI(RSA_PUBLIC_KEY.trim(), 'RSA-OAEP');

    // 使用 JWE 加密
    const jwe = new CompactEncrypt(new TextEncoder().encode(JSON.stringify({ password })));

    // 设置保护头部，指定加密算法和加密方式
    jwe.setProtectedHeader({
      alg: 'RSA-OAEP',
      enc: 'A256GCM'
    });

    const encrypted = await jwe.encrypt(publicKey);

    return encrypted;
  } catch (error) {
    console.error('RSA加密失败:', error);
    throw error;
  }
};
