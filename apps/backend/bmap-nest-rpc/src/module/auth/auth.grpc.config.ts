import { join } from 'path';

import { grpcConfig } from '@/config/grpc.config';

export const authGrpcConfig = {
  options: {
    package: 'auth',
    // 使用绝对路径，确保在开发和生产环境都能找到文件
    protoPath: join(process.cwd(), 'src/proto/auth.proto'),
    ...grpcConfig,
  },
};
