import { LoginPayload, LoginRes } from '@/types/api';
import { request } from '@/utils/request';

/**
 * 测试列表查询
 * @param data
 * @returns
 */
export const testTableList = async (data: LoginPayload): Promise<LoginRes> => {
  return await request.post('/table/search', data);
};
