import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { request } from '@/utils/httpClient';

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