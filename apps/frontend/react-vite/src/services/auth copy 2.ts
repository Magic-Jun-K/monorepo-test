// import { authClient } from '@/utils/grpc/grpc-client';
// // 不需要导入create，直接使用构造函数
// import { 
//   LoginRequest, 
//   EmailLoginRequest, 
//   SendVerificationCodeRequest, 
//   LogoutRequest, 
//   RefreshTokenRequest, 
//   GetCurrentUserRequest,
//   ValidateTokenRequest
// } from '@/generated/auth_pb';
// import { handleGrpcError } from '@/utils/grpc/grpc-error-handler';
// import { request } from '@/utils/httpClient';
// import { authStore } from '@/stores/auth.store';

// export interface LoginPayload {
//   username?: string; // 账号登录时使用
//   password?: string; // 账号登录时使用
//   email?: string; // 邮箱登录时使用
//   code?: string; // 邮箱登录时使用
// }

// export interface LoginRes {
//   success: boolean;
//   message: string;
//   accessToken?: string;
// }

// export interface RefreshRes {
//   success: boolean;
//   message: string;
//   accessToken?: string;
// }

// export interface CurrentUserRes {
//   data: {
//     id: number;
//     username: string;
//     role: string;
//   };
// }

// /**
//  * 用户注册
//  * @param data
//  * @returns
//  */
// export const register = async (data: { username: string; password: string }): Promise<LoginRes> => {
//   return await request.post('/admin/register', data);
// };

// /**
//  * 用户登录
//  * @param data
//  * @returns
//  */
// export const login = async (data: LoginPayload): Promise<LoginRes> => {
//   const request = new LoginRequest({
//     username: data.username || '',
//     password: data.password || ''
//   });

//   try {
//     const response = await authClient.login(request);
//     const res = response as { success: boolean; message: string; };
//     return {
//       success: res.success,
//       message: res.message,
//       accessToken: res.data?.accessToken
//     };
//   } catch (error) {
//     const result = handleGrpcError(error);
//     return {
//       success: false,
//       message: result.message
//     };
//   }
// };

// /**
//  * 发送验证码
//  * @param email
//  * @returns
//  */
// export const sendVerificationCode = async (email: string) => {
//   const request = new SendVerificationCodeRequest({
//     email
//   });

//   try {
//     const response = await authClient.sendVerificationCode(request);
//     const res = response as { success: boolean; message: string; };
//     return {
//       success: res.success,
//       message: res.message
//     };
//   } catch (error) {
//     const result = handleGrpcError(error);
//     return {
//       success: false,
//       message: result.message
//     };
//   }
// };

// /**
//  * 验证码登录
//  * @param email
//  * @param code
//  * @returns
//  */
// export const emailLogin = async (params: { email: string; code: string }): Promise<LoginRes> => {
//   const request = new EmailLoginRequest({
//     email: params.email,
//     code: params.code
//   });

//   try {
//     const response = await authClient.emailLogin(request);
//     const res = response as { success: boolean; message: string; };
//     return {
//       success: res.success,
//       message: res.message,
//       accessToken: res.data?.accessToken
//     };
//   } catch (error) {
//     const result = handleGrpcError(error);
//     return {
//       success: false,
//       message: result.message
//     };
//   }
// };

// /**
//  * 用户退出登录
//  * @returns
//  */
// export const logout = async () => {
//   const refreshToken = localStorage.getItem('refreshToken') || '';
//   const request = new LogoutRequest({
//     refreshToken
//   });

//   try {
//     const response = await authClient.logout(request);
//     const res = response as { success: boolean; message: string; };
//     authStore.clear();
//     return {
//       success: res.success,
//       message: res.message
//     };
//   } catch (error) {
//     const result = handleGrpcError(error);
//     return {
//       success: false,
//       message: result.message
//     };
//   }
// };

// /**
//  * 刷新token
//  * @returns
//  */
// export const refreshToken = async (): Promise<RefreshRes> => {
//   const request = new RefreshTokenRequest({
//     refreshToken: '' // 需要从本地存储获取refreshToken
//   });

//   try {
//     const response = await authClient.refreshToken(request);
//     const res = response as { success: boolean; message: string; };
//     return {
//       success: res.success,
//       message: res.message,
//       accessToken: res.data?.accessToken
//     };
//   } catch (error) {
//     const result = handleGrpcError(error);
//     return {
//       success: false,
//       message: result.message
//     };
//   }
// };

// /**
//  * 获取当前用户信息
//  * @returns
//  */
// export const currentUser = async (): Promise<CurrentUserRes> => {
//   const request = new GetCurrentUserRequest({});

//   try {
//     const response = await authClient.getCurrentUser(request);
//     const res = response as unknown;
//     return {
//       data: res.data ? {
//         id: res.data.id,
//         username: res.data.username,
//         role: res.data.role
//       } : { id: 0, username: '', role: '' }
//     };
//   } catch (error) {
//     const result = handleGrpcError(error);
//     throw new Error(result.message);
//   }
// };

// /**
//  * 校验token
//  * @returns
//  */
// export const validateToken = async (): Promise<{ success: boolean; message: string }> => {
//   const request = new ValidateTokenRequest({
//     token: authStore.getAccessToken() || ''
//   });

//   try {
//     const response = await authClient.validateToken(request);
//     const res = response as { success: boolean; message: string; };
//     return {
//       success: res.success,
//       message: res.message
//     };
//   } catch (error) {
//     const result = handleGrpcError(error);
//     return {
//       success: false,
//       message: result.message
//     };
//   }
// };
