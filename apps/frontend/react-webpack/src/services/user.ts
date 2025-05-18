import { request } from '@/utils/request';

/**
 * 获取用户列表
 * @param params 
 * @returns 
 */
export async function fetchUsers(params: unknown) {
  return request.get('/users', { params });
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
 * @param file 
 * @returns 
 */
export async function importUsers(file: File) {
  const formData = new FormData();
  formData.append('file', file);
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
