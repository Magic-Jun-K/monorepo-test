import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { createClient } from '@connectrpc/connect';

import { AuthService } from '@/generated/auth_connect';

const transport = createGrpcWebTransport({
  baseUrl: '/api/grpc'
});

// 使用v1.6.1的正确客户端创建方式
export const authClient = createClient(AuthService, transport);
