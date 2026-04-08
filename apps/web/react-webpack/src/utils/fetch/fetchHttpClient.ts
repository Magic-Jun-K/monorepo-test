/**
 * 基于fetch和TanStack Query的HTTP客户端
 * 替代axios实现，提供类似的功能
 */

import { useAuthStore } from '@/stores/zustand/auth.store';

// 基础配置
const BASE_CONFIG = {
  baseURL: '/api',
  timeout: 5000,
  credentials: 'include' as RequestCredentials, // 允许跨域
};

// 请求配置接口
interface FetchRequestConfig extends RequestInit {
  url?: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
}


// HTTP错误类
class HttpError extends Error {
  public response: Response;
  public config: FetchRequestConfig;
  public status?: number;

  constructor(message: string, response: Response, config: FetchRequestConfig) {
    super(message);
    this.name = 'HttpError';
    this.response = response;
    this.config = config;
    this.status = response.status;
  }
}

// 请求队列和刷新状态
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
const MAX_RETRY_COUNT = 2;

// 处理请求队列
function processQueue(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

// 构建完整的URL
function buildURL(url: string, params?: Record<string, unknown>): string {
  const fullUrl = url.startsWith('http') ? url : `${BASE_CONFIG.baseURL}${url}`;

  if (!params) return fullUrl;

  const urlObj = new URL(fullUrl, window.location.origin);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      urlObj.searchParams.append(key, String(params[key]));
    }
  });

  return urlObj.toString();
}

// 超时控制
function createTimeoutSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller.signal;
}

// 处理响应
async function handleResponse<T>(response: Response, config: FetchRequestConfig): Promise<T> {
  // 处理非JSON响应
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (response.ok) {
      return response.text() as Promise<T>;
    }
    throw new HttpError(`HTTP ${response.status}: ${response.statusText}`, response, config);
  }

  const data = await response.json();

  if (response.ok) {
    return data;
  }

  throw new HttpError(data.message || `HTTP ${response.status}: ${response.statusText}`, response, config);
}

// 刷新Token
async function refreshToken(): Promise<string> {
  try {
    const response = await fetch(`${BASE_CONFIG.baseURL}/auth/refresh`, {
      method: 'POST',
      credentials: BASE_CONFIG.credentials,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('刷新Token失败');
    }

    const data = await response.json();
    return data.data || data; // 兼容不同的响应格式
  } catch (error) {
    console.error('刷新Token失败:', error);
    throw error;
  }
}

// 核心请求函数
async function request<T>(config: FetchRequestConfig & { _retryCount?: number }): Promise<T> {
  const {
    url = '',
    params,
    data,
    headers = {},
    method = 'GET',
    _retryCount = 0,
    ...restConfig
  } = config;

  // 构建完整URL
  const fullURL = buildURL(url, params);

  // 设置请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 添加认证头
  const accessToken = useAuthStore.getState().getAccessToken();
  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  // 准备请求配置
  const fetchConfig: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: BASE_CONFIG.credentials,
    signal: createTimeoutSignal(BASE_CONFIG.timeout),
    ...restConfig,
  };

  // 添加请求体
  if (data && method !== 'GET' && method !== 'HEAD') {
    fetchConfig.body = typeof data === 'string' ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(fullURL, fetchConfig);

    // 处理非401错误
    if (response.status !== 401) {
      if (!response.ok) {
        switch (response.status) {
          case 403:
            console.error('权限不足');
            break;
          case 404:
            console.error('资源不存在');
            break;
          case 500:
            console.error('服务器错误');
            break;
          default:
            console.error('请求错误:', response.status, response.statusText);
        }
      }
      return handleResponse<T>(response, config);
    }

    // 处理401错误 - Token过期

    // 刷新接口本身出错 - 直接跳转登录
    if (url.includes('/auth/refresh')) {
      console.error('刷新Token失败，跳转登录页');
      useAuthStore.getState().clear();
      window.location.href = `/account/login?redirect=${window.location.pathname}`;
      throw new HttpError('刷新Token失败', response, config);
    }

    // 超过最大重试次数 - 跳转登录
    if (_retryCount >= MAX_RETRY_COUNT) {
      console.error(`超过最大重试次数(${MAX_RETRY_COUNT})，跳转登录页`);
      useAuthStore.getState().clear();
      window.location.href = `/account/login?redirect=${window.location.pathname}`;
      throw new HttpError('超过最大重试次数', response, config);
    }

    // 如果正在刷新Token，将请求加入队列
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push(token => {
          if (token) {
            // 重试原始请求
            const retryConfig = {
              ...config,
              _retryCount: _retryCount + 1,
              headers: {
                ...headers,
                Authorization: `Bearer ${token}`,
              },
            };
            request<T>(retryConfig).then(resolve).catch(reject);
          } else {
            reject(new Error('Token刷新失败'));
          }
        });
      });
    }

    // 开始刷新Token
    isRefreshing = true;

    try {
      const newAccessToken = await refreshToken();

      if (newAccessToken) {
        // 更新存储中的Token
        useAuthStore.getState().setToken(newAccessToken);

        // 处理队列中的请求
        processQueue(newAccessToken);

        // 重试原始请求
        const retryConfig = {
          ...config,
          _retryCount: _retryCount + 1,
          headers: {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        };
        return request<T>(retryConfig);
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
      throw refreshError;
    } finally {
      isRefreshing = false;
    }

  } catch (error: unknown) {
    // 网络错误或其他错误
    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求超时');
    }

    throw new Error(`网络错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 创建HTTP客户端
class FetchHttpClient {
  async get<T>(url: string, config?: Omit<FetchRequestConfig, 'method' | 'url'>): Promise<T> {
    return request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: unknown, config?: Omit<FetchRequestConfig, 'method' | 'url' | 'data'>): Promise<T> {
    return request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: unknown, config?: Omit<FetchRequestConfig, 'method' | 'url' | 'data'>): Promise<T> {
    return request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T>(url: string, config?: Omit<FetchRequestConfig, 'method' | 'url'>): Promise<T> {
    return request<T>({ ...config, method: 'DELETE', url });
  }

  async patch<T>(url: string, data?: unknown, config?: Omit<FetchRequestConfig, 'method' | 'url' | 'data'>): Promise<T> {
    return request<T>({ ...config, method: 'PATCH', url, data });
  }
}

// 导出HTTP客户端实例
export const fetchClient = new FetchHttpClient();

// 导出请求函数（兼容axios风格）
export const fetchRequest = {
  get: fetchClient.get.bind(fetchClient),
  post: fetchClient.post.bind(fetchClient),
  put: fetchClient.put.bind(fetchClient),
  delete: fetchClient.delete.bind(fetchClient),
  patch: fetchClient.patch.bind(fetchClient),
};

// 默认导出
export default fetchRequest;
