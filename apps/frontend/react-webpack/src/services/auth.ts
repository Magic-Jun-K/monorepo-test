import { request } from '@/utils/request';
import { authStore } from '@/store/auth.store';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginRes {
  data: {
    access_token: string;
  };
}

export interface CurrentUserRes {
  data: {
    username: string;
    email: string;
  };
}

/**
 * 用户登录
 * @param data
 * @returns
 */
export const login = async (data: LoginPayload): Promise<LoginRes> => {
  return await request.post('/auth/login', data);
};

/**
 * 获取当前用户信息
 * @returns
 */
export const currentUser = async (): Promise<CurrentUserRes> => {
  return await request.get('/current-user');
};

/**
 * 用户注册
 * @param data
 * @returns
 */
export const register = async (data: { username: string; password: string }) => {
  return await request.post('/admin/register', data);
};

/**
 * 用户退出登录
 * @returns
 */
export const logout = async () => {
  const refreshToken = authStore.getRefreshToken();
  return await request.post('/auth/logout', { refresh_token: refreshToken });
};
