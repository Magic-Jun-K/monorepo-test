import { argon2id } from 'hash-wasm';

// 统一的 Argon2 参数
const argon2Options = {
  parallelism: 1, // 并行度
  iterations: 3, // 迭代次数
  memorySize: 65536, // 内存大小（KB）
  hashLength: 16, // 输出哈希长度
  outputType: 'encoded' as const // 返回编码后的字符串
};

// 加密密码
export const encrypt = async (password: string): Promise<string> => {
  // 密钥
  const salt = '$argon2id$v=19$m=65536,t=3,p=1$1jiZ0Ta4CbiTqCrm2HHldA$vCokBV4QlgM7XSgOmgR+6UIXcmr+jnyE13b/Lpnjdh8';

  return argon2id({
    password,
    salt,
    ...argon2Options // 使用统一的参数
  });
};
