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

// 自动将本地存储的 token 添加到请求头
request.interceptors.request.use(config => {
  return config;
});

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  async error => {
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
