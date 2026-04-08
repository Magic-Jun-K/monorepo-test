/**
 * TanStack Query与fetch客户端集成示例
 * 展示如何使用新的fetch客户端替代axios
 */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { fetchRequest } from './fetchHttpClient';

// 类型定义
interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  status: string;
  isSuperAdmin: boolean;
  roles?: Array<{
    id: number;
    name: string;
    code: string;
    level: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface UserListResponse {
  total: number;
  list: User[];
}

interface CurrentUser {
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
}

// ==================== 查询 Hooks ====================

/**
 * 获取用户列表 - 使用fetch客户端替代axios
 */
export const useUsers = (params?: { page?: number; pageSize?: number; username?: string }) => {
  return useQuery<UserListResponse>({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await fetchRequest.get('/users', { params });
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
  });
};

/**
 * 获取当前用户信息 - 使用fetch客户端
 */
export const useCurrentUser = () => {
  return useQuery<CurrentUser>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetchRequest.get('/current-user');
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    retry: 1, // 失败时重试1次
  });
};

/**
 * 获取用户详情
 */
export const useUserDetail = (userId: string | number) => {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetchRequest.get(`/users/${userId}`);
      return response;
    },
    enabled: !!userId, // 只有userId存在时才执行查询
    staleTime: 3 * 60 * 1000,
  });
};

// ==================== 变更 Hooks ====================

/**
 * 用户登录 - 使用fetch客户端
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetchRequest.post('/auth/login', credentials);
      return response;
    },
    onSuccess: (data) => {
      // 登录成功后刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // 可以在这里处理token存储
      if (data.access_token) {
        // authStore.setToken(data.access_token);
      }
    },
  });
};

/**
 * 创建用户
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetchRequest.post('/users', userData);
      return response;
    },
    onSuccess: () => {
      // 创建成功后刷新用户列表
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * 更新用户
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string | number; data: Partial<User> }) => {
      const response = await fetchRequest.put(`/users/${userId}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      // 更新成功后刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};

/**
 * 删除用户
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      const response = await fetchRequest.delete(`/users/${userId}`);
      return response;
    },
    onSuccess: () => {
      // 删除成功后刷新用户列表
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * 刷新Token
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetchRequest.post('/auth/refresh');
      return response;
    },
    onSuccess: (data) => {
      // 更新token存储
      if (data.access_token) {
        // authStore.setToken(data.access_token);
      }
    },
  });
};

/**
 * 用户登出
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetchRequest.post('/auth/logout');
      return response;
    },
    onSuccess: () => {
      // 清除所有缓存
      queryClient.clear();
      // 可以在这里清除本地存储的token
      // authStore.clear();
    },
  });
};

// ==================== 高级查询 Hooks ====================

/**
 * 分页查询用户列表 - 优化性能
 */
export const usePaginatedUsers = (page: number, pageSize: number, search?: string) => {
  return useQuery({
    queryKey: ['users', 'paginated', page, pageSize, search],
    queryFn: async () => {
      const response = await fetchRequest.get('/users', {
        params: { page, pageSize, username: search },
      });
      return response;
    },
    placeholderData: (previousData) => previousData, // 保持上一页数据作为占位符
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * 无限滚动加载用户
 */
export const useInfiniteUsers = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchRequest.get('/users', {
        params: { page: pageParam, pageSize },
      });
      return {
        ...response,
        nextPage: pageParam + 1,
        hasMore: response.list?.length === pageSize,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1,
  });
};

// ==================== 工具函数 ====================

/**
 * 预加载数据
 */
import { QueryClient } from '@tanstack/react-query';

export const prefetchUser = async (queryClient: QueryClient, userId: string | number) => {
  await queryClient.prefetchQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetchRequest.get(`/users/${userId}`);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 乐观更新示例
 */
export const useOptimisticUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string | number; data: unknown }) => {
      const response = await fetchRequest.put(`/users/${userId}`, data);
      return response;
    },
    onMutate: async (variables) => {
      // 取消相关查询
      await queryClient.cancelQueries({ queryKey: ['users'] });
      await queryClient.cancelQueries({ queryKey: ['user', variables.userId] });

      // 保存当前数据快_snapshot
      const previousUsers = queryClient.getQueryData(['users']);
      const previousUser = queryClient.getQueryData(['user', variables.userId]);

      // 乐观更新
      queryClient.setQueryData(['user', variables.userId], (old: unknown) => ({
        ...(old as object),
        ...(variables.data as object),
      }));

      // 返回回滚数据
      return { previousUsers, previousUser };
    },
    onError: (_err, variables, context) => {
      // 回滚到之前的状态
      if (context) {
        queryClient.setQueryData(['users'], context.previousUsers);
        queryClient.setQueryData(['user', variables.userId], context.previousUser);
      }
    },
    onSettled: (_data, _error, variables) => {
      // 重新获取数据以确保一致性
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};

export default {
  useUsers,
  useCurrentUser,
  useUserDetail,
  useLogin,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useRefreshToken,
  useLogout,
  usePaginatedUsers,
  useInfiniteUsers,
  prefetchUser,
  useOptimisticUpdateUser,
};
