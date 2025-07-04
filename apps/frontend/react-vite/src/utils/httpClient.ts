import axios, { CreateAxiosDefaults } from 'axios';

// import { reportError } from './monitor';

// 配置axios实例
const config: CreateAxiosDefaults = {
  baseURL: '/api',
  timeout: 5000,
  withCredentials: true // 允许跨域
};

// 创建axios实例
export const request = axios.create(config);

// 请求拦截器
request.interceptors.request.use(config => {
  return config;
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

function subscribeTokenRefresh(cb: () => void) {
  refreshSubscribers.push(cb);
}
function onRefreshed() {
  refreshSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
}

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;

    // 401 且不是刷新接口本身
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 检查是否已在刷新中
      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh(() => {
            resolve(request(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 前端刷新token中...');
        const refreshResponse = await request.post('/auth/refresh');

        console.log('refreshResponse:', refreshResponse);
        isRefreshing = false;
        onRefreshed();

        // // Extract new access token from response
        // const newAccessToken = refreshResponse.data?.access_token;

        // if (newAccessToken) {
        //   console.log('✅ 前端token刷新成功');
        //   // Update request headers with new token
        //   originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        // }

        return request(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        console.error('刷新token失败:', refreshError);
        window.location.href = '/account/login';
        return Promise.reject(refreshError);
      }
    }

    // 1. 错误分类处理
    if (error.response) {
      switch (error.response.status) {
        case 403:
          // 处理权限不足
          console.error('权限不足');
          break;
        case 404:
          // 处理资源不存在
          console.error('资源不存在');
          break;
        case 500:
          // 处理服务器错误
          console.error('服务器错误');
          break;
        default:
          console.error('请求错误:', error);
      }
    }

    // 2. 错误上报
    // reportError(error, {
    //   url: error.config?.url,
    //   method: error.config?.method,
    //   status: error.response?.status
    // });

    return Promise.reject(error);
  }
);
