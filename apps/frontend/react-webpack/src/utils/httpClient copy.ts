// import axios, { CreateAxiosDefaults } from 'axios';
// import { decodeJwt } from 'jose';

// import { authStore } from '@/store/auth.store';
// import { refreshToken } from '@/services/auth';
// // import { reportError } from './monitor';

// // 配置axios实例
// const config: CreateAxiosDefaults = {
//   baseURL: '/api',
//   timeout: 5000,
//   withCredentials: true // 允许跨域
// };

// // 创建axios实例
// export const request = axios.create(config);

// // 自动将本地存储的 token 添加到请求头
// request.interceptors.request.use(config => {
//   const accessToken = authStore.getAccessToken();
//   if (!accessToken) return config;

//   // 有效性检测
//   try {
//     const { exp } = decodeJwt(accessToken);
//     if (exp && exp * 1000 < Date.now()) {
//       // 不要直接跳转，而是让请求失败，触发响应拦截器中的刷新逻辑
//       // authStore.clear();
//       // window.location.href = '/account/login';
//       // return Promise.reject(new Error('Token expired'));

//       // 不要直接reject，让请求继续发送
//       // 响应拦截器会处理401错误

//       // 让请求继续发送，由响应拦截器处理401
//       console.log('Token已过期，等待刷新');
//     }

//     // 无论是否过期，都添加token到请求头
//     // 如果过期，响应拦截器会处理刷新逻辑
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   } catch (error) {
//     console.error('Token解析失败:', error);
//     authStore.clear();
//   }

//   return config;
// });

// let isRefreshing = false; // 刷新标记
// let refreshSubscribers: ((token: string) => void)[] = []; // 刷新订阅者
// const MAX_RETRIES = 3; // 最大重试次数
// const INITIAL_RETRY_DELAY = 1000; // 初始重试延迟时间（毫秒）

// // 添加刷新订阅
// const subscribeTokenRefresh = (cb: (token: string) => void) => {
//   refreshSubscribers.push(cb);
// };

// // 执行刷新订阅
// const onRefreshed = (token: string) => {
//   refreshSubscribers.map(cb => cb(token));
//   refreshSubscribers = [];
// };

// // 计算重试延迟时间（指数退避）
// const getRetryDelay = (retryCount: number) => {
//   return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), 10000); // 最大延迟10秒
// };

// // 判断是否需要重试
// const shouldRetry = (error: any) => {
//   // 网络错误
//   if (!error.response) return true;

//   // 服务器错误
//   if (error.response.status >= 500) return true;

//   // 特定状态码
//   const retryableStatusCodes = [408, 429]; // 超时和太多请求
//   if (retryableStatusCodes.includes(error.response.status)) return true;

//   return false;
// };

// // 处理token过期
// const handleTokenExpired = () => {
//   authStore.clear();
//   window.location.href = '/account/login';
// };

// // 响应拦截器
// request.interceptors.response.use(
//   response => response.data,
//   async error => {
//     const originalRequest = error.config; // 保存原始请求

//     // 如果是刷新token的请求失败，直接处理
//     if (originalRequest.url.includes('auth/refresh')) {
//       handleTokenExpired();
//       return Promise.reject(error);
//     }

//     // 设置重试计数
//     originalRequest._retryCount = originalRequest._retryCount || 0;

//     // 判断是否需要重试
//     if (shouldRetry(error) && originalRequest._retryCount < MAX_RETRIES) {
//       originalRequest._retryCount++;

//       // 计算延迟时间
//       const delay = getRetryDelay(originalRequest._retryCount);
//       console.log(`请求失败，第${originalRequest._retryCount}次重试，延迟${delay}ms`);

//       // 等待后重试
//       await new Promise(resolve => setTimeout(resolve, delay));

//       // 重试请求
//       return request(originalRequest);
//     }

//     // 处理401未授权错误
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       // 确保只存在一个刷新请求
//       if (!isRefreshing) {
//         isRefreshing = true;
//         try {
//           // 刷新token
//           const { data } = await refreshToken();
//           authStore.setTokens(data);
//           onRefreshed(data);
//           return request(originalRequest);
//         } catch (error) {
//           handleTokenExpired();
//           return Promise.reject(error);
//         } finally {
//           isRefreshing = false; // 刷新完成
//         }
//       }

//       // 等待刷新完成
//       return new Promise(resolve => {
//         // 添加刷新订阅
//         subscribeTokenRefresh(newToken => {
//           // 更新请求头
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           resolve(request(originalRequest));
//         });
//       });
//     }

//     // 1. 错误分类处理
//     if (error.response) {
//       switch (error.response.status) {
//         case 403:
//           // 处理权限不足
//           console.error('权限不足');
//           break;
//         case 404:
//           // 处理资源不存在
//           console.error('资源不存在');
//           break;
//         case 500:
//           // 处理服务器错误
//           console.error('服务器错误');
//           break;
//         default:
//           console.error('请求错误:', error);
//       }
//     }

//     // 2. 错误上报
//     // reportError(error, {
//     //   url: error.config?.url,
//     //   method: error.config?.method,
//     //   status: error.response?.status
//     // });

//     return Promise.reject(error);
//   }
// );
