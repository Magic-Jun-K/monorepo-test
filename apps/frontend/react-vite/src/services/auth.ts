import { request } from '@/utils/httpClient';
import { authStore } from '@/stores/auth.store';

export interface LoginPayload {
  username?: string;
  password?: string;
  email?: string;
  code?: string;
}

export interface LoginRes {
  success: boolean;
  message: string;
  accessToken?: string | undefined;
}

export interface RefreshRes {
  success: boolean;
  message: string;
  accessToken?: string | undefined;
}

export interface CurrentUserRes {
  data: {
    id: number;
    username: string;
    role: string;
  };
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface LoginData {
  accessToken: string;
}

interface CurrentUserData {
  id: number;
  username: string;
  role: string;
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
  const payload = {
    username: data.username || '',
    password: data.password || '',
  };

  try {
    const response = await request.post<ApiResponse<LoginData>>('/grpc/auth/login', payload);
    if (response.success && response.data) {
      authStore.setToken(response.data.accessToken);
    }
    return {
      success: response.success,
      message: response.message,
      accessToken: response.data?.accessToken,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * 发送验证码
 * @param email
 * @returns
 */
export const sendVerificationCode = async (email: string) => {
  const payload = { email };

  try {
    const response = await request.post<ApiResponse>('/grpc/auth/send-code', payload);
    return {
      success: response.success,
      message: response.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * 验证码登录
 * @param email
 * @param code
 * @returns
 */
export const emailLogin = async (params: { email: string; code: string }): Promise<LoginRes> => {
  const payload = {
    email: params.email,
    code: params.code,
  };

  try {
    const response = await request.post<ApiResponse<LoginData>>('/grpc/auth/email-login', payload);
    if (response.success && response.data) {
      authStore.setToken(response.data.accessToken);
    }
    return {
      success: response.success,
      message: response.message,
      accessToken: response.data?.accessToken,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * 用户退出登录
 * @returns
 */
export const logout = async () => {
  try {
    const response = await request.post<ApiResponse>('/grpc/auth/logout');
    authStore.clear();
    return {
      success: response.success,
      message: response.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * 刷新token
 * @returns
 */
export const refreshToken = async (): Promise<RefreshRes> => {
  try {
    const response = await request.post<ApiResponse<LoginData>>('/grpc/auth/refresh');
    if (response.success && response.data) {
      authStore.setToken(response.data.accessToken);
    }
    return {
      success: response.success,
      message: response.message,
      accessToken: response.data?.accessToken,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * 获取当前用户信息
 * @returns
 */
export const currentUser = async (): Promise<CurrentUserRes> => {
  const accessToken = authStore.getAccessToken();
  const payload = { accessToken };

  try {
    const response = await request.post<ApiResponse<CurrentUserData>>(
      '/grpc/auth/current-user',
      payload,
    );
    return {
      data: response.data
        ? {
            id: response.data.id,
            username: response.data.username,
            role: response.data.role,
          }
        : { id: 0, username: '', role: '' },
    };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

/**
 * 校验token
 * @returns
 */
export const validateToken = async (): Promise<{ success: boolean; message: string }> => {
  const payload = { token: authStore.getAccessToken() || '' };

  try {
    const response = await request.post<ApiResponse>('/grpc/auth/validate-token', payload);
    return {
      success: response.success,
      message: response.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
