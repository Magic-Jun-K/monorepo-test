import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { request } from '@/utils/httpClient';

export interface LoginPayload {
  username?: string; // 账号登录时使用
  password?: string; // 账号登录时使用
  email?: string; // 邮箱登录时使用
  code?: string; // 邮箱登录时使用
}

export interface LoginRes {
  success: boolean;
  message: string;
  data: string;
}

export interface RefreshRes {
  success: boolean;
  data: string;
}

export interface CurrentUserRes {
  data: {
    id: number;
    username: string;
    email: string;
    userType?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    roles?: Array<{
      id: number;
      name: string;
      code: string;
      level: number;
    }>;
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
  return await request.post('/auth/logout');
};

/**
 * 刷新token
 * @returns
 */
export const refreshToken = async (): Promise<RefreshRes> => {
  return await request.post('/auth/refresh');
  // return await request.post('/auth/refresh-error'); // 模拟一个错误的请求，使用一个不存在的路径
};

/**
 * 获取当前用户信息
 * @returns
 */
export const currentUser = async (): Promise<CurrentUserRes> => {
  const user = (await request.get('/auth/current-user')) as {
    id: number;
    username: string;
    email: string;
    userType?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    roles?: Array<{
      id: number;
      name: string;
      code: string;
      level: number;
    }>;
  };
  return {
    data: user,
  };
};

// TanStack Query hooks
// 获取当前用户信息
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: currentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// 登录
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      // 登录成功后，使 currentUser 查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

// 登出
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 登出成功后，清除 currentUser 查询缓存
      queryClient.removeQueries({ queryKey: ['currentUser'] });
    },
  });
};
