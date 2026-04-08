# 从 Axios 迁移到 Fetch + TanStack Query 指南

## 概述

本文档介绍了如何将现有的 Axios 客户端迁移到新的 Fetch + TanStack Query 实现。新的实现提供了更好的性能、更强大的缓存机制以及更现代化的开发体验。

## 主要变化

### 1. 请求方式的变化

#### 原 Axios 方式
```typescript
// 原axios实现
import { request } from '@/utils/httpClient';

// GET请求
const response = await request.get('/users');

// POST请求
const response = await request.post('/users', { name: 'John' });

// 带参数的请求
const response = await request.get('/users', { 
  params: { page: 1, pageSize: 10 } 
});
```

#### 新 Fetch 方式
```typescript
// 新fetch实现 - 直接使用fetchRequest（类似axios的API）
import { fetchRequest } from '@/utils/fetchHttpClient';

// GET请求
const response = await fetchRequest.get('/users');

// POST请求
const response = await fetchRequest.post('/users', { name: 'John' });

// 带参数的请求
const response = await fetchRequest.get('/users', { 
  params: { page: 1, pageSize: 10 } 
});
```

### 2. 使用 TanStack Query 的推荐方式

```typescript
// 使用自定义Hook（推荐）
import { useUsers, useCreateUser } from '@/utils/fetchQueryHooks';

// 查询数据
const { data, isLoading, error } = useUsers({ page: 1, pageSize: 10 });

// 创建数据
const createUserMutation = useCreateUser();
await createUserMutation.mutateAsync({ name: 'John' });
```

## 迁移步骤

### 步骤1: 替换导入语句

```typescript
// 旧的导入
import { request } from '@/utils/httpClient';

// 新的导入
import { fetchRequest } from '@/utils/fetchHttpClient';
// 或者使用TanStack Query Hook
import { useUsers } from '@/utils/fetchQueryHooks';
```

### 步骤2: 替换基本请求

```typescript
// 旧代码
const fetchUsers = async () => {
  try {
    const response = await request.get('/users');
    setUsers(response.data);
  } catch (error) {
    console.error('获取用户失败:', error);
  }
};

// 新代码 - 直接替换
const fetchUsers = async () => {
  try {
    const response = await fetchRequest.get('/users');
    setUsers(response.data); // API保持一致
  } catch (error) {
    console.error('获取用户失败:', error);
  }
};
```

### 步骤3: 使用 TanStack Query（推荐）

```typescript
// 旧代码 - 手动管理状态和副作用
const UserList: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    request.get('/users')
      .then(response => setUsers(response.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return <div>{/* 渲染用户列表 */}</div>;
};

// 新代码 - 使用TanStack Query
const UserList: React.FC = () => {
  const { data, isLoading, error } = useUsers({ page: 1, pageSize: 10 });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return <div>{/* 渲染用户列表 */}</div>;
};
```

### 步骤4: 处理表单提交

```typescript
// 旧代码
const CreateUserForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await request.post('/users', formData);
      alert('用户创建成功！');
      setFormData({ name: '', email: '' });
    } catch (error) {
      alert(`创建失败: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* 表单字段 */}</form>;
};

// 新代码 - 使用TanStack Query
const CreateUserForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const createUserMutation = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createUserMutation.mutateAsync(formData);
      alert('用户创建成功！');
      setFormData({ name: '', email: '' });
    } catch (error) {
      alert(`创建失败: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit" disabled={createUserMutation.isPending}>
        {createUserMutation.isPending ? '创建中...' : '创建用户'}
      </button>
    </form>
  );
};
```

### 步骤5: 处理分页

```typescript
// 旧代码
const PaginatedUserList: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    request.get('/users', { params: { page, pageSize: 10 } })
      .then(response => {
        setUsers(response.data.list);
        setTotal(response.data.total);
      });
  }, [page]);

  return (
    <div>
      {/* 用户列表 */}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        上一页
      </button>
      <span>第 {page} 页</span>
      <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total}>
        下一页
      </button>
    </div>
  );
};

// 新代码 - 使用分页Hook
const PaginatedUserList: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isFetching, isPlaceholderData } = usePaginatedUsers(page, 10);

  return (
    <div>
      {/* 用户列表 */}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        上一页
      </button>
      <span>第 {page} 页</span>
      <button 
        onClick={() => setPage(p => p + 1)} 
        disabled={isPlaceholderData || data?.list?.length < 10}
      >
        下一页
      </button>
      {isFetching && <span>加载中...</span>}
    </div>
  );
};
```

## API 对照表

### 基础请求方法

| Axios 方法 | Fetch 方法 | 说明 |
|-----------|-----------|------|
| `request.get(url)` | `fetchRequest.get(url)` | GET请求 |
| `request.post(url, data)` | `fetchRequest.post(url, data)` | POST请求 |
| `request.put(url, data)` | `fetchRequest.put(url, data)` | PUT请求 |
| `request.patch(url, data)` | `fetchRequest.patch(url, data)` | PATCH请求 |
| `request.delete(url)` | `fetchRequest.delete(url)` | DELETE请求 |

### 请求配置

| Axios 配置 | Fetch 配置 | 说明 |
|-----------|-----------|------|
| `{ params: {...} }` | `{ params: {...} }` | URL参数 |
| `{ headers: {...} }` | `{ headers: {...} }` | 自定义请求头 |
| `{ timeout: 5000 }` | `{ timeout: 5000 }` | 请求超时 |
| `{ withCredentials: true }` | `{ credentials: 'include' }` | 跨域凭证 |

### 响应处理

| Axios 响应 | Fetch 响应 | 说明 |
|-----------|-----------|------|
| `response.data` | `response.data` | 响应数据（保持一致） |
| `response.status` | `response.status` | HTTP状态码 |
| `response.headers` | `response.headers` | 响应头 |

## 新增功能

### 1. TanStack Query 集成

- **自动缓存**: 查询结果自动缓存，避免重复请求
- **后台刷新**: 组件重新挂载时自动刷新数据
- **乐观更新**: 立即更新UI，后台同步数据
- **错误重试**: 自动重试失败的请求
- **分页支持**: 内置分页查询支持

### 2. 改进的错误处理

```typescript
// 新的错误处理
const { data, error } = useUsers();

if (error) {
  // 错误信息更加丰富
  console.log('错误码:', error.code);
  console.log('错误消息:', error.message);
  console.log('错误详情:', error.details);
}
```

### 3. 性能优化

- **请求去重**: 相同请求自动去重
- **请求队列**: Token刷新时自动排队请求
- **内存管理**: 更好的内存泄漏防护

## 迁移注意事项

### 1. 认证处理

新的fetch客户端会自动处理Token刷新，无需手动处理401错误：

```typescript
// 旧代码 - 需要手动处理401
const fetchData = async () => {
  try {
    const response = await request.get('/users');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // 需要手动刷新Token
      await refreshToken();
      // 重新请求
      return request.get('/users');
    }
    throw error;
  }
};

// 新代码 - 自动处理
const fetchData = async () => {
  const response = await fetchRequest.get('/users');
  return response.data;
  // 401错误会自动触发Token刷新
};
```

### 2. 文件上传

文件上传时需要特别注意不要设置Content-Type：

```typescript
// 正确的文件上传
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return fetchRequest.post('/upload', formData, {
    headers: {
      // 不要设置Content-Type，让浏览器自动设置
      'Content-Type': undefined,
    },
  });
};
```

### 3. 并发请求

新的fetch客户端支持所有标准的Promise模式：

```typescript
// Promise.all
const [users, posts] = await Promise.all([
  fetchRequest.get('/users'),
  fetchRequest.get('/posts'),
]);

// Promise.race
const fastest = await Promise.race([
  fetchRequest.get('/api1'),
  fetchRequest.get('/api2'),
]);
```

## 常见问题

### Q: 是否需要修改所有的API调用？

A: 不需要。可以直接替换`request`为`fetchRequest`，API基本保持一致。但推荐使用TanStack Query来获得更好的开发体验。

### Q: TanStack Query 的缓存如何工作？

A: TanStack Query会自动缓存查询结果，并在以下情况下刷新：
- 组件重新挂载
- 窗口重新获得焦点
- 网络重新连接
- 手动调用`refetch`

### Q: 如何处理离线状态？

A: TanStack Query内置了网络状态检测，会自动处理离线/在线状态。你也可以使用`useIsOnline`等Hook来监听网络状态。

### Q: 是否支持GraphQL？

A: 是的，fetch客户端支持任何HTTP请求，包括GraphQL。你也可以使用专门的GraphQL客户端如Apollo Client。

## 最佳实践

### 1. 使用自定义Hook

```typescript
// ✅ 推荐：使用自定义Hook
const { data, isLoading, error } = useUsers({ page: 1, pageSize: 10 });

// ❌ 不推荐：直接使用fetchRequest
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetchRequest.get('/users')
    .then(response => setUsers(response.data))
    .finally(() => setLoading(false));
}, []);
```

### 2. 使用乐观更新

```typescript
// ✅ 推荐：使用乐观更新
const updateUserMutation = useUpdateUser();

updateUserMutation.mutate(
  { id: 1, name: 'New Name' },
  {
    optimisticUpdates: {
      queryKey: ['users'],
      update: (oldData, newData) => 
        oldData.map(user => 
          user.id === newData.id ? { ...user, ...newData } : user
        ),
    },
  }
);
```

### 3. 错误处理

```typescript
// ✅ 推荐：使用错误边界和错误处理
const UserComponent: React.FC = () => {
  const { data, error, refetch } = useUsers();

  if (error) {
    return (
      <ErrorBoundary error={error} onRetry={refetch}>
        <p>加载用户列表失败</p>
      </ErrorBoundary>
    );
  }

  return <UserList users={data} />;
};
```

### 4. 分页处理

```typescript
// ✅ 推荐：使用分页Hook
const UserList: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isFetching, isPlaceholderData } = usePaginatedUsers(page, 10);

  return (
    <div>
      {/* 用户列表 */}
      <Pagination
        current={page}
        onChange={setPage}
        hasNext={!isPlaceholderData && data?.list?.length === 10}
      />
      {isFetching && <LoadingIndicator />}
    </div>
  );
};
```

## 性能对比

| 功能 | Axios | Fetch + TanStack Query |
|------|-------|----------------------|
| 包大小 | ~13KB | ~8KB (fetch) + ~12KB (TanStack Query) |
| 缓存 | 无 | ✅ 自动缓存 |
| 后台刷新 | 无 | ✅ 自动刷新 |
| 乐观更新 | 手动 | ✅ 内置支持 |
| 错误重试 | 手动 | ✅ 自动重试 |
| 请求去重 | 无 | ✅ 自动去重 |
| TypeScript | ✅ | ✅ 更好的类型推断 |

## 总结

迁移到Fetch + TanStack Query可以带来：

1. **更好的性能**: 自动缓存和请求去重
2. **更好的用户体验**: 后台刷新和乐观更新
3. **更简单的代码**: 无需手动管理加载状态和错误处理
4. **更强的类型安全**: 更好的TypeScript支持

虽然需要一些初始的学习成本，但长期来看会带来更好的开发体验和用户体验。