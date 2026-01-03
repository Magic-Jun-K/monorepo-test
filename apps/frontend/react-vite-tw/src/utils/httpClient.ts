import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults
} from 'axios';

import { useAuthStore } from '@/stores/zustand/auth.store';
// import { reportError } from './monitor';

interface CustomRequest extends AxiosInstance {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

// 配置axios实例
const config: CreateAxiosDefaults = {
  baseURL: '/api',
  timeout: 5000, // 超时时间
  withCredentials: true // 允许跨域
};

// 创建axios实例
export const request: CustomRequest = axios.create(config);

// 请求队列和刷新状态
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
const MAX_RETRY_COUNT = 2; // 最大重试次数

// 处理请求队列
function processQueue(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

// 请求拦截器
request.interceptors.request.use(config => {
  const accessToken = useAuthStore.getState().getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async error => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retryCount?: number;
    };

    // 1. 处理非401错误
    if (!error.response || error.response.status !== 401) {
      // 在这里处理其他错误类型
      if (error.response) {
        switch (error.response.status) {
          case 403:
            console.error('权限不足');
            // 可以在这里添加权限不足的处理逻辑
            break;
          case 404:
            console.error('资源不存在');
            break;
          case 500:
            console.error('服务器错误');
            break;
          default:
            console.error('请求错误:', error);
        }
      } else if (error.request) {
        console.error('网络错误:', error.message);
      } else {
        console.error('请求配置错误:', error.message);
      }

      return Promise.reject(error);
    }

    // 2. 处理401错误
    // 初始化重试计数
    originalRequest._retryCount = originalRequest._retryCount || 0;

    // 刷新接口本身出错 - 直接跳转登录
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.error('刷新Token失败，跳转登录页');
      useAuthStore.getState().clear();
      // window.location.href = '/account/login';
      window.location.href = `/account/login?redirect=${window.location.pathname}`;
      return Promise.reject(error);
    }

    // 超过最大重试次数 - 跳转登录
    if (originalRequest._retryCount >= MAX_RETRY_COUNT) {
      console.error(`超过最大重试次数(${MAX_RETRY_COUNT})，跳转登录页`);
      useAuthStore.getState().clear();
      window.location.href = `/account/login?redirect=${window.location.pathname}`;
      return Promise.reject(error);
    }

    // 增加重试计数
    originalRequest._retryCount++;

    // 如果正在刷新Token，将请求加入队列
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push(token => {
          if (token) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          request(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    // 开始刷新Token
    isRefreshing = true;

    try {
      // 发送刷新Token请求
      const refreshResponse = await request.post('/auth/refresh') as {
        success: boolean;
        data: string;
      };
      const newAccessToken = refreshResponse.data;

      if (newAccessToken) {
        // 更新存储中的Token
        useAuthStore.getState().setToken(newAccessToken);

        // 处理队列中的请求
        processQueue(newAccessToken);

        // 更新原始请求的Token并重试
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return request(originalRequest);
      } else {
        throw new Error('刷新Token返回空值');
      }
    } catch (refreshError) {
      console.error('刷新Token失败:', refreshError);

      // 处理刷新失败后队列中的请求
      processQueue(''); // 传递空token表示刷新失败

      // 跳转登录页
      useAuthStore.getState().clear();
      window.location.href = `/account/login?redirect=${window.location.pathname}`;
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }

    // 错误上报
    // reportError(error, {
    //   url: error.config?.url,
    //   method: error.config?.method,
    //   status: error.response?.status
    // });

    // return Promise.reject(error);
  }
);
