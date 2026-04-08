/**
 * fetch客户端使用示例
 * 展示如何从axios迁移到fetch + TanStack Query
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useUsers,
  useCurrentUser,
  useLogin,
  useCreateUser,
  usePaginatedUsers
} from './fetchQueryHooks';
import { fetchRequest } from './fetchHttpClient';

// 类型定义
interface Role {
  id: number;
  name: string;
  code: string;
  level: number;
}

interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  roles?: Role[];
  status: string;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserListResponse {
  total: number;
  list: User[];
}

// ==================== 基础使用示例 ====================

/**
 * 示例1: 基础组件中使用fetch客户端
 */
export const BasicFetchExample: React.FC = () => {
  const [data, setData] = useState<UserListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 直接使用fetchRequest（类似axios的使用方式）
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 原axios方式: await request.get('/users')
      const result = await fetchRequest.get('/users');
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? '加载中...' : '获取用户列表'}
      </button>
      {error && <div style={{ color: 'red' }}>错误: {error}</div>}
      {data && <div>用户数: {data.total}</div>}
    </div>
  );
};

/**
 * 示例2: 使用TanStack Query进行数据获取
 * 自动处理加载状态、错误处理、缓存等
 */
export const QueryExample: React.FC = () => {
  // 使用自定义Hook（基于TanStack Query）
  const { data, isLoading, error } = useUsers({ page: 1, pageSize: 10 });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div>
      <h3>用户列表</h3>
      <div>总用户数: {data?.total || 0}</div>
      <ul>
        {data?.list?.map((user: User) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

/**
 * 示例3: 表单提交和变更操作
 */
export const FormExample: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // 使用变更Hook
  const createUserMutation = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUserMutation.mutateAsync({
        username,
        email,
        status: 'active',
        isSuperAdmin: false,
        roles: [{ id: 0, name: 'user', code: 'user', level: 0 }]
      });

      // 成功后的处理
      alert('用户创建成功！');
      setUsername('');
      setEmail('');
    } catch (error: unknown) {
      alert(`创建失败: ${error instanceof Error ? error.message : '创建用户失败'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          用户名:
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          邮箱:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={createUserMutation.isPending}>
        {createUserMutation.isPending ? '创建中...' : '创建用户'}
      </button>
      {createUserMutation.isError && (
        <div style={{ color: 'red' }}>错误: {createUserMutation.error.message}</div>
      )}
    </form>
  );
};

/**
 * 示例4: 分页查询
 */
export const PaginationExample: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 使用分页Hook
  const { data, isLoading, isFetching, isPlaceholderData } = usePaginatedUsers(page, pageSize);

  return (
    <div>
      <h3>用户列表（分页）</h3>

      {isLoading ? (
        <div>加载中...</div>
      ) : (
        <div>
          <ul>
            {data?.list?.map((user: User) => (
              <li key={user.id}>{user.username} - {user.email}</li>
            ))}
          </ul>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </button>

            <span style={{ margin: '0 10px' }}>第 {page} 页</span>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={isPlaceholderData || data?.list?.length < pageSize}
            >
              下一页
            </button>

            {isFetching && <span style={{ marginLeft: '10px' }}>加载中...</span>}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 示例5: 用户登录和认证
 */
export const LoginExample: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin();
  const { data: currentUser, isLoading } = useCurrentUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync({ username, password });
      alert('登录成功！');
    } catch (error: unknown) {
      alert(`登录失败: ${error instanceof Error ? error.message : '登录失败'}`);
    }
  };

  if (isLoading) return <div>检查登录状态中...</div>;

  if (currentUser) {
    return (
      <div>
        <h3>欢迎, {currentUser.username}!</h3>
        <p>当前用户: {currentUser.email}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <h3>用户登录</h3>
      <div>
        <label>
          用户名:
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          密码:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? '登录中...' : '登录'}
      </button>
      {loginMutation.isError && (
        <div style={{ color: 'red' }}>错误: {loginMutation.error.message}</div>
      )}
    </form>
  );
};

/**
 * 示例6: 错误处理和重试
 */
export const ErrorHandlingExample: React.FC = () => {
  const [shouldFail, setShouldFail] = useState(false);

  // 使用TanStack Query的内置重试机制
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['errorTest', shouldFail],
    queryFn: async () => {
      const endpoint = shouldFail ? '/users-error' : '/users';
      const response = await fetchRequest.get(endpoint);
      return response;
    },
    retry: 3, // 重试3次
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避
    enabled: false, // 手动触发
  });

  return (
    <div>
      <h3>错误处理和重试示例</h3>
      <label>
        <input
          type="checkbox"
          checked={shouldFail}
          onChange={(e) => setShouldFail(e.target.checked)}
        />
        模拟错误请求
      </label>
      <br />
      <button onClick={() => refetch()} disabled={isLoading}>
        {isLoading ? '请求中...' : '发送请求'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          请求失败: {error.message}
          <br />
          <small>已自动重试，点击按钮重新尝试</small>
        </div>
      )}

      {data && (
        <div style={{ color: 'green', marginTop: '10px' }}>
          请求成功！用户数: {data.total}
        </div>
      )}
    </div>
  );
};

/**
 * 示例7: 文件上传
 */
export const FileUploadExample: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 使用fetchRequest上传文件
      await fetchRequest.post('/upload', formData, {
        headers: {
          // 不要设置Content-Type，让浏览器自动设置
        },
      });

      alert('上传成功！');
      setFile(null);
    } catch (error: unknown) {
      alert(`上传失败: ${error instanceof Error ? error.message : '上传文件失败'}`);
    }
  };

  return (
    <div>
      <h3>文件上传示例</h3>
      <input type="file" onChange={handleFileChange} />
      {file && (
        <div>
          <p>选择的文件: {file.name}</p>
          <button onClick={handleUpload}>上传文件</button>
        </div>
      )}
    </div>
  );
};

// 并发请求结果类型
interface ConcurrentResults {
  users: number;
  currentUser: string;
  statistics: number;
}

/**
 * 示例8: 并发请求
 */
export const ConcurrentRequestsExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ConcurrentResults | null>(null);

  const handleConcurrentRequests = async () => {
    setIsLoading(true);

    try {
      // 使用Promise.all进行并发请求
      const [users, currentUser, statistics] = await Promise.all([
        fetchRequest.get('/users') as Promise<UserListResponse>,
        fetchRequest.get('/current-user') as Promise<User>,
        fetchRequest.get('/statistics') as Promise<{ count: number }>,
      ]);

      setResults({
        users: users.total,
        currentUser: currentUser?.username || '未登录',
        statistics: statistics.count,
      });
    } catch (error: unknown) {
      alert(`请求失败: ${error instanceof Error ? error.message : '并发请求失败'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>并发请求示例</h3>
      <button onClick={handleConcurrentRequests} disabled={isLoading}>
        {isLoading ? '请求中...' : '发送并发请求'}
      </button>

      {results && (
        <div style={{ marginTop: '10px' }}>
          <p>用户总数: {results.users}</p>
          <p>当前用户: {results.currentUser}</p>
          <p>统计数据: {results.statistics}</p>
        </div>
      )}
    </div>
  );
};

/**
 * 所有示例的整合组件
 */
export const FetchClientExamples: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Fetch客户端使用示例</h2>

      <div style={{ marginBottom: '30px' }}>
        <h3>基础使用</h3>
        <BasicFetchExample />
      </div>

      <hr />

      <div style={{ marginBottom: '30px' }}>
        <h3>TanStack Query集成</h3>
        <QueryExample />
      </div>

      <hr />

      <div style={{ marginBottom: '30px' }}>
        <h3>表单提交</h3>
        <FormExample />
      </div>

      <hr />

      <div style={{ marginBottom: '30px' }}>
        <h3>分页查询</h3>
        <PaginationExample />
      </div>

      <hr />

      <div style={{ marginBottom: '30px' }}>
        <h3>用户认证</h3>
        <LoginExample />
      </div>

      <hr />

      <div style={{ marginBottom: '30px' }}>
        <h3>错误处理</h3>
        <ErrorHandlingExample />
      </div>

      <hr />

      <div style={{ marginBottom: '30px' }}>
        <h3>文件上传</h3>
        <FileUploadExample />
      </div>

      <hr />

      <div style={{ marginBottom: '30px' }}>
        <h3>并发请求</h3>
        <ConcurrentRequestsExample />
      </div>
    </div>
  );
};

export default FetchClientExamples;
