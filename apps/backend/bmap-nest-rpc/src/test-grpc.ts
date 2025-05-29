// import { NestFactory } from '@nestjs/core';

// import { AuthGrpcClient } from './module/auth/auth.client';
// import { AppModule } from './app.module';

// async function testGrpcAuth() {
//   console.log('开始测试gRPC认证服务...');

//   // 创建 NestJS 应用实例
//   const app = await NestFactory.createApplicationContext(AppModule);

//   // 获取 AuthGrpcClient 实例
//   const client = app.get(AuthGrpcClient);

//   try {
//     console.log('正在测试登录...');
//     const loginResult = await client.login(
//       'test123',
//       '$argon2id$v=19$m=65536,t=3,p=1$JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTMscD0xJDFqaVowVGE0Q2JpVHFDcm0ySEhsZEEkdkNva0JWNFFsZ003WFNnT21nUis2VUlYY21yK2pueUUxM2IvTHBuamRoOA$DsQx4m2srfK25pGXsu2ggA',
//     ); // 使用数据库中实际存在的用户名密码
//     console.log('✅ 登录测试成功:', loginResult);

//     // 如果登录成功，测试其他方法
//     if (loginResult && loginResult.success && loginResult.data) {
//       console.log('正在测试获取当前用户信息...');
//       const userResult = await client.getCurrentUser(
//         loginResult.data.accessToken,
//       );
//       console.log('✅ 获取用户信息成功:', userResult);
//     }
//   } catch (error) {
//     console.error('❌ gRPC测试失败:', error.message);
//     console.error('详细错误:', error);
//   } finally {
//     // 关闭应用
//     await app.close();
//   }
// }
// testGrpcAuth();
// // PS D:\Files\VSCode\BaiduMap\canvaskit-test\apps\backend\bmap-nest-rpc> npx ts-node -r tsconfig-paths/register src/test-grpc.ts
// // npx ts-node -r tsconfig-paths/register src/test-grpc.ts
