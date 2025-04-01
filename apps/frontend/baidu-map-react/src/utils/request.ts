import axios, { CreateAxiosDefaults } from 'axios';
import { decodeJwt } from 'jose';

import { authStore } from '@/store/auth.store';

const config: CreateAxiosDefaults = {
  baseURL: '/api',
  timeout: 5000
};

export const request = axios.create(config);

// 自动将本地存储的 token 添加到请求头
request.interceptors.request.use(config => {
  const accessToken = authStore.getAccessToken();

  // 有效性检测
  if (accessToken) {
    try {
      const { exp } = decodeJwt(accessToken);
      console.log('测试token', accessToken);
      console.log('测试exp', exp);
      console.log('测试Date.now()', Date.now());
      if (exp && exp * 1000 < Date.now()) {
        authStore.clear();
        window.location.href = '/account/login';
        return Promise.reject(new Error('Token expired'));
      }
    } catch {
      authStore.clear();
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 添加刷新订阅
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// 执行刷新订阅
const onRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;

    // 处理 401 错误
    if (error.response?.status === 401) {
      console.log('Token失效处理流程开始');

      // 清除无效token
      authStore.clear();

      // 如果是刷新token请求失败
      if (originalRequest.url.includes('auth/refresh')) {
        window.location.href = '/account/login';
        return Promise.reject(error);
      }

      // 处理自动刷新
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // 防止并发请求重复刷新
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const { data } = await axios.post('/auth/refresh', {
              refresh_token: authStore.getRefreshToken()
            });

            authStore.setTokens(data.access_token, data.refresh_token, !!localStorage.getItem('refresh_token'));

            onRefreshed(data.access_token);
            return request(originalRequest);
          } catch {
            authStore.clear();
            window.location.href = '/account/login';
          } finally {
            isRefreshing = false;
          }
        }

        return new Promise(resolve => {
          subscribeTokenRefresh(newToken => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(request(originalRequest));
          });
        });
      }
    }

    // 处理其他错误
    if (error.response?.status === 403) {
      console.log('权限不足');
    }

    return Promise.reject(error);
  }
);
