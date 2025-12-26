import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchCom, TableCom, Space, message, Modal } from '@eggshell/antd-ui';
import { Button } from '@eggshell/tailwindcss-ui';
import { Plus, Import, Download } from 'lucide-react';
import dayjs from 'dayjs';

import ContainerBody from '@/layout/ContainerBody';
import AddUserModal from './components/AddUserModal';
import ImportUserModal from './components/ImportUserModal';
import EditUserModal from './components/EditUserModal';
import { searchItems, getTableColumns } from './constant';
import { fetchUsers, exportUsers, batchExportUsers, deleteUser } from '@/services/user';
import { currentUser } from '@/services/auth';

// 处理搜索参数中的日期范围
const processDateRange = (params: SearchParams) => {
  const processedParams = { ...params };

  // 格式化创建时间范围
  if (processedParams.createdAtRange && Array.isArray(processedParams.createdAtRange)) {
    const [start, end] = processedParams.createdAtRange;
    processedParams.createdAtRange = [
      start ? dayjs(start).format('YYYY-MM-DD 00:00:00') : '',
      end ? dayjs(end).format('YYYY-MM-DD 23:59:59') : ''
    ];
  }

  // 格式化更新时间范围
  if (processedParams.updatedAtRange && Array.isArray(processedParams.updatedAtRange)) {
    const [start, end] = processedParams.updatedAtRange;
    processedParams.updatedAtRange = [
      start ? dayjs(start).format('YYYY-MM-DD 00:00:00') : '',
      end ? dayjs(end).format('YYYY-MM-DD 23:59:59') : ''
    ];
  }

  return processedParams;
};

import styles from './index.module.scss';

interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  status: string;
  isSuperAdmin: boolean;
  roles?: Role[];
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: number;
  name: string;
  code: string;
  type: string;
  level: number;
  isSuperAdmin: boolean;
  description?: string;
}

interface SearchParams {
  username?: string;
  email?: string;
  phone?: string;
  status?: string;
  role?: string;
  createdAtRange?: [string, string];
  updatedAtRange?: [string, string];
  page?: number;
  pageSize?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface UserListResponse {
  list: User[];
  total: number;
}

export default function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<User[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  // 搜索参数
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 10
  });
  // 新增用户弹框
  const [addModalVisible, setAddModalVisible] = useState(false);
  // 导入用户弹框
  const [importModalVisible, setImportModalVisible] = useState(false);
  // 编辑用户弹框
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  // 获取用户列表
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // 处理搜索参数，特别是日期范围参数
      const processedParams = processDateRange(searchParams);

      const response = await fetchUsers(processedParams) as ApiResponse<UserListResponse>;
      if (response.success) {
        setUsers(response.data.list || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      messageApi.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [searchParams, messageApi]);

  // 权限检查
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await currentUser();
        const user = response.data;

        // 检查用户权限：只有管理员和超级管理员才能访问用户管理页面
        if (!user.userType || user.userType === 'user') {
          messageApi.error('您没有访问用户管理页面的权限');
          navigate('/');
          return;
        }

        // 有权限，加载用户数据
        loadUsers();
      } catch (error) {
        console.error('权限检查失败:', error);
        messageApi.error('权限验证失败，请重新登录');
        navigate('/login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkPermission();
  }, [navigate, loadUsers, messageApi]); // 添加依赖项

  // 初始化加载（在权限检查通过后调用）
  useEffect(() => {
    if (!authLoading) {
      loadUsers();
    }
  }, [authLoading, loadUsers]);

  // 分页处理
  const handlePageChange = (page: number, pageSize: number) => {
    setSearchParams(prev => ({
      ...prev,
      page,
      pageSize
    }));
  };

  // 导出用户
  const handleExportUsers = async () => {
    try {
      const response = await exportUsers(searchParams);
      const blobResponse = response as unknown as Blob;
      const url = window.URL.createObjectURL(blobResponse);
      const link = document.createElement('a');
      link.href = url;
      link.download = '用户列表.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      messageApi.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      messageApi.error('导出失败');
    }
  };

  // 批量导出选中用户
  const handleBatchExport = async () => {
    if (selectedRows.length === 0) {
      messageApi.warning('请选择要导出的用户');
      return;
    }

    try {
      const ids = selectedRows.map(row => row.id);
      const response = await batchExportUsers(ids);
      const blobResponse = response as unknown as Blob;
      const url = window.URL.createObjectURL(blobResponse);
      const link = document.createElement('a');
      link.href = url;
      link.download = '选中用户.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      messageApi.success('批量导出成功');
    } catch (error) {
      console.error('批量导出失败:', error);
      messageApi.error('批量导出失败');
    }
  };

  // 编辑用户
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditModalVisible(true);
  };

  // 删除用户
  const handleDeleteUser = (user: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await deleteUser(user.id) as ApiResponse<unknown>;
          if (response.success) {
            messageApi.success('删除用户成功');
            loadUsers(); // 重新加载用户列表
          } else {
            messageApi.error(response.message || '删除用户失败');
          }
        } catch (error) {
          console.error('删除用户失败:', error);
          messageApi.error('删除用户失败');
        }
      }
      // onCancel: () => {
      //   console.log('用户取消删除操作');
      // }
    });
  };

  // 表格列定义
  const columns = getTableColumns(handleEditUser, handleDeleteUser);

  // 选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: User[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    }
  };

  // 权限检查加载中
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>权限验证中...</p>
        </div>
      </div>
    );
  }

  return (
    <ContainerBody>
      {contextHolder}
      {/* 搜索区域 */}
      <SearchCom
        items={searchItems}
        // 不直接使用 searchParams 作为 initialValues，避免将格式化后的字符串传回给组件
        onSearch={values => {
          // 处理时间范围参数，确保它们以字符串格式传递
          const processedValues = processDateRange(values);
          setSearchParams(prev => ({ ...prev, ...processedValues, page: 1 }));
        }}
        onReset={() => {
          setSearchParams({
            page: 1,
            pageSize: 10
          });
        }}
      />

      {/* 操作按钮区域 */}
      <div className={styles.actionCard}>
        <Space>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setAddModalVisible(true)}>
            新增用户
          </Button>
          <Button icon={<Import size={16} />} onClick={() => setImportModalVisible(true)}>
            导入用户
          </Button>
          <Button icon={<Download size={16} />} onClick={handleExportUsers}>
            导出用户
          </Button>
          <Button
            icon={<Download size={16} />}
            onClick={handleBatchExport}
            disabled={selectedRows.length === 0}
          >
            批量导出选中
          </Button>
        </Space>
      </div>

      {/* 表格区域 */}
      <TableCom
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: searchParams.page || 1,
          pageSize: searchParams.pageSize || 10,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange
        }}
        scroll={{ x: 1000 }}
      />

      {/* 新增用户弹框 */}
      <AddUserModal
        visible={addModalVisible}
        onOk={() => setAddModalVisible(false)}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={() => loadUsers()}
      />

      {/* 导入用户弹框 */}
      <ImportUserModal
        visible={importModalVisible}
        onOk={() => setImportModalVisible(false)}
        onCancel={() => setImportModalVisible(false)}
        onSuccess={loadUsers}
      />

      {/* 编辑用户弹框 */}
      <EditUserModal
        visible={editModalVisible}
        user={editingUser}
        onOk={() => setEditModalVisible(false)}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={loadUsers}
      />
    </ContainerBody>
  );
}
