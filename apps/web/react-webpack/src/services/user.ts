import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { request } from '@/utils/httpClient';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface UserProfileData {
  id: number;
  username: string;
  email: string;
  phone: string;
  roles: unknown[];
  profile: {
    avatar?: string;
    nickname?: string;
    bio?: string;
    gender?: string;
  };
  hasPassword: boolean;
  oAuths: Array<{
    id: number;
    provider: string;
    providerId: string;
    createdAt: string;
  }>;
}

export interface AvatarUploadData {
  url: string;
}

/**
 * 获取用户列表
 * @param params 
 * @returns 
 */
export async function fetchUsers(params: unknown) {
  return request.post('/users/list', params);
}

/**
 * 新增用户
 * @param data 
 * @returns 
 */
export async function createUser(data: unknown) {
  return request.post('/users', data);
}

/**
 * 导入用户
 * @param formData 包含用户数据文件的FormData对象
 * @returns 
 */
export async function importUsers(formData: FormData) {
  return request.post('/users/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

/**
 * 导出用户
 * @param params 
 * @returns 
 */
export async function exportUsers(params: unknown) {
  return request.get('/users/export', {
    params,
    responseType: 'blob'
  });
}

/**
 * 批量导出用户
 * @param ids 
 * @returns 
 */
export async function batchExportUsers(ids: number[]) {
  return request.post('/users/batch-export', { ids }, {
    responseType: 'blob'
  });
}

/**
 * 更新用户
 * @param id 
 * @param data 
 * @returns 
 */
export async function updateUser(id: number, data: unknown) {
  return request.put(`/users/${id}`, data);
}

/**
 * 删除用户
 * @param id 
 * @returns 
 */
export async function deleteUser(id: number) {
  return request.delete(`/users/${id}`);
}

/**
 * 获取当前登录用户完整信息
 */
export async function fetchProfile() {
  return request.get('/users/profile');
}

/**
 * 获取登录方式
 */
export async function fetchAuthMethods() {
  return request.get('/users/auth-methods');
}

/**
 * 绑定登录方式
 */
export async function bindAuth(data: unknown) {
  return request.post('/users/bind-auth', data);
}

/**
 * 解绑登录方式
 */
export async function unbindAuth(data: { provider: string }) {
  return request.delete('/users/unbind-auth', { data });
}

/**
 * 获取个人资料
 */
export async function getProfile() {
  return request.get<ApiResponse<UserProfileData>>('/users/profile');
}

/**
 * 更新个人资料
 * @param data 
 */
export async function updateProfile(data: unknown) {
  return request.put<ApiResponse>('/users/profile', data);
}

/**
 * 修改密码
 * @param data 
 */
export async function changePassword(data: unknown) {
  return request.put<ApiResponse>('/users/profile/password', data);
}

/**
 * 设置密码
 * @param data 
 */
export async function setPassword(data: unknown) {
  return request.post<ApiResponse>('/users/profile/password', data);
}

/**
 * 上传头像
 * @param formData 
 */
export async function uploadAvatar(formData: FormData) {
  return request.post<ApiResponse<AvatarUploadData>>('/users/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// TanStack Query hooks
// 获取用户列表
export const useUsers = (params: unknown) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
  });
};

// 新增用户
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // 新增用户成功后，使用户列表查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

// 更新用户
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => updateUser(id, data),
    onSuccess: () => {
      // 更新用户成功后，使用户列表查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

// 删除用户
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // 删除用户成功后，使用户列表查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};