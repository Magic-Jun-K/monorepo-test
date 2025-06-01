export const grpcConfig = {
  url: '0.0.0.0:50051',
  loader: {
    keepCase: true, // 保持字段名称的大小写
    longs: String, // 使用字符串表示长整型
    enums: String, // 使用字符串表示枚举类型
    defaults: true, // 使用默认值
    oneofs: true, // 使用 oneof
    // keepalive: {
    //   keepaliveTimeMs: 30000,
    //   keepaliveTimeoutMs: 10000,
    //   keepalivePermitWithoutCalls: true,
    //   http2MaxPingsWithoutData: 0,
    // },
  },
  // maxConnectionAgeMs: 300000, // 5分钟
  // maxConnectionAgeGraceMs: 10000,
};
