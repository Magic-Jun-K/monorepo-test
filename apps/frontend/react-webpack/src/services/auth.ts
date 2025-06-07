import { request } from '@/utils/request';
import { authStore } from '@/store/auth.store';

export interface LoginPayload {
  username?: string; // 账号登录时使用
  password?: string; // 账号登录时使用
  email?: string; // 邮箱登录时使用
  code?: string; // 邮箱登录时使用
}

export interface LoginRes {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

export interface CurrentUserRes {
  data: {
    username: string;
    email: string;
  };
}

/**
 * 用户注册
 * @param data
 * @returns
 */
export const register = async (data: { username: string; password: string }): Promise<LoginRes> => {
  return await request.post('/admin/register', data);
};

/**
 * 用户登录
 * @param data
 * @returns
 */
export const login = async (data: LoginPayload): Promise<LoginRes> => {
  return await request.post('/auth/login', data);
};

/**
 * 发送验证码
 * @param email
 * @returns
 */
export const sendCode = async (email: string) => {
  return await request.post('/auth/send-code', { email });
};

/**
 * 验证码登录
 * @param email
 * @param code
 * @returns
 */
export const emailLogin = async (params: { email: string; code: string }): Promise<LoginRes> => {
  return await request.post('/auth/email-login', params);
};

/**
 * 用户退出登录
 * @returns
 */
export const logout = async () => {
  const refreshToken = authStore.getRefreshToken();
  return await request.post('/auth/logout', { refresh_token: refreshToken });
};

/**
 * 获取当前用户信息
 * @returns
 */
export const currentUser = async (): Promise<CurrentUserRes> => {
  return await request.get('/current-user');
};