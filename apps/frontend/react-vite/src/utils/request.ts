import axios, { CreateAxiosDefaults } from 'axios';

import { authStore } from '@/store/auth.store';

// 创建一个 axios 实例
const axiosConfig: CreateAxiosDefaults = {
  baseURL: '/api',
  timeout: 5000
};

const request = axios.create(axiosConfig);

// 自动将本地存储的 token 添加到请求头
request.interceptors.request.use(
  config => {
    const accessToken = authStore.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 是否正在刷新token
let isRefreshing = false;
// 重试队列
let refreshSubscribers: ((token: string) => void)[] = [];

// 添加刷新订阅，订阅 token 刷新事件
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// 执行刷新订阅，刷新完成后执行队列中的请求
const onRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;

    // 如果响应状态码是 401（未授权）
    if (error.response?.status === 401) {
      console.log('Token失效处理流程开始');

      // 如果是刷新token的请求失败，直接跳转登录页
      if (originalRequest.url.includes('auth/refresh')) {
        authStore.clear(); // 清除无效token
        window.location.href = '/account/login';
        return Promise.reject(error);
      }

      // 防止并发请求重复刷新
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = authStore.getRefreshToken();

        if (!refreshToken) {
          authStore.clear();
          window.location.href = '/account/login';
          return Promise.reject(error);
        }

        try {
          // 请求刷新token
          const response = await axios.post('/api/auth/refresh', {
            refresh_token: refreshToken
          });

          console.log('拦截器刷新Token响应:', response.data);

          // 检查响应格式
          const tokenData = response.data;
          let accessToken, _refreshToken;

          if (tokenData && tokenData.access_token && tokenData.refresh_token) {
            // 直接使用顶层数据
            accessToken = tokenData.access_token;
            _refreshToken = tokenData.refresh_token;
          } else if (tokenData && tokenData.data && tokenData.data.access_token && tokenData.data.refresh_token) {
            // 使用嵌套的 data 对象
            accessToken = tokenData.data.access_token;
            _refreshToken = tokenData.data.refresh_token;
          } else {
            throw new Error('刷新Token响应格式不正确');
          }

          // 更新token
          const rememberMe = !!localStorage.getItem('refresh_token');
          authStore.setTokens(accessToken, _refreshToken, rememberMe);

          console.log('🔄 Token 已通过拦截器成功刷新！', new Date().toLocaleTimeString());

          // 通知所有等待的请求
          onRefreshed(accessToken);

          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('刷新token失败', refreshError);
          authStore.clear();
          // window.location.href = '/account/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 如果已经在刷新中，将请求加入队列
        return new Promise(resolve => {
          subscribeTokenRefresh(newToken => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axios(originalRequest));
          });
        });
      }
    }

    // 如果是 403 错误，可能是权限问题
    if (error.response?.status === 403) {
      console.log('权限不足', error.response.data);
    }

    return Promise.reject(error);
  }
);
export { request };
