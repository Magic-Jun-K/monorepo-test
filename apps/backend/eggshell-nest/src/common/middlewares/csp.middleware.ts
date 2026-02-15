// // csp.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import { webcrypto } from 'node:crypto';
// import kyber from 'crystals-kyber-js'; // 轻量级 ML-KEM 实现

// // 初始化量子安全参数
// const KYBER_PARAMS = {
//   level: 768, // NIST 1级安全（抗量子）
//   seedSize: 32, // 量子随机熵大小
// };

// // 预生成服务器密钥对（启动时一次）
// let serverKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array };

// (async () => {
//   serverKeyPair = kyber.keyPair(KYBER_PARAMS.level);
// })();

// export async function quantumSecureCSP(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   try {
//     // 1. 生成量子随机熵（混合熵源）
//     const entropy = new Uint8Array([
//       ...(await webcrypto.getRandomValues(new Uint8Array(16))),
//       ...kyber.randomBytes(16),
//     ]);

//     // 2. 使用 ML-KEM 生成 nonce
//     const { sharedKey } = kyber.encrypt(serverKeyPair.publicKey, entropy);
//     const nonce = Buffer.from(sharedKey).toString('base64').slice(0, 24);

//     // 3. CSP 策略（保持你的严格设置）
//     const csp = [
//       "default-src 'none';",
//       "base-uri 'self';",
//       `connect-src 'self' ${process.env.API_BASE_URL};`,
//       "font-src 'self' https: data:;",
//       "form-action 'self';",
//       "frame-ancestors 'none';",
//       `img-src 'self' data: ${process.env.IMAGE_CDN_URL};`,
//       `script-src 'self' 'nonce-${nonce}' ${process.env.ANALYTICS_URL || ''};`,
//       `style-src 'self' 'nonce-${nonce}';`,
//       'upgrade-insecure-requests;',
//       `report-uri ${process.env.CSP_REPORT_URI};`,
//       'report-to csp-report;',
//     ].join(' ');

//     // 4. 设置响应头
//     res.setHeader('Content-Security-Policy', csp);
//     res.setHeader(
//       'Report-To',
//       JSON.stringify({
//         group: 'csp-report',
//         max_age: 10886400,
//         endpoints: [{ url: process.env.CSP_REPORT_URI }],
//       }),
//     );

//     // 5. 传递 nonce
//     res.locals.cspNonce = nonce;
//   } catch (error) {
//     // 量子算法失败时回退到传统加密
//     const fallbackNonce = webcrypto.getRandomValues(new Uint8Array(16));
//     res.locals.cspNonce = Buffer.from(fallbackNonce).toString('base64');
//     console.error('Quantum nonce failed, using fallback:', error);
//   } finally {
//     next();
//   }
// }
