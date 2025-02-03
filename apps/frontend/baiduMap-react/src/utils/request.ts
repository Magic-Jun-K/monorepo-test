import axios, { CreateAxiosDefaults } from 'axios';

const config: CreateAxiosDefaults = {
  baseURL: '/api',
  timeout: 5000
};

export const request = axios.create(config);

// 自动将本地存储的 token 添加到请求头
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.token = token;
  }
  return config;
});

// 如果返回权限不足，跳转到登录页
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response.status === 401) {
      localStorage.removeItem('token'); // 清除过期 token
      window.location.href = '/account/login';
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
