import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchCom, /* TableCom, */ Table, Space } from '@eggshell/antd-ui';
import { Button, message } from '@eggshell/unocss-ui';
import { PlusOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';

import ContainerBody from '@/layout/ContainerBody';
import AddUserModal from './components/AddUserModal';
import ImportUserModal from './components/ImportUserModal';
import { searchItems, getTableColumns } from './constant';
import { fetchUsers, exportUsers, batchExportUsers } from '@/services/user';
import { currentUser } from '@/services/auth';

import styles from './index.module.scss';

interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  status: string;
  isSuperAdmin: boolean;
  roles?: any[];
  createdAt: string;
  updatedAt: string;
}

interface SearchParams {
  username?: string;
  email?: string;
  phone?: string;
  status?: string;
  page?: number;
  pageSize?: number;
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

  const [messageApi, contextHolder] = message.useMessage();

  // 获取用户列表
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchUsers(searchParams);
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
  }, [searchParams]);

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
  }, []); // 只在组件挂载时执行一次

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
      const url = window.URL.createObjectURL(new Blob([response.data]));
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
      const url = window.URL.createObjectURL(new Blob([response.data]));
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

  // 表格列定义
  const columns = getTableColumns();

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
        initialValues={searchParams}
        onSearch={values => {
          setSearchParams(prev => ({ ...prev, ...values, page: 1 }));
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
            新增用户
          </Button>
          <Button icon={<ImportOutlined />} onClick={() => setImportModalVisible(true)}>
            导入用户
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExportUsers}>
            导出用户
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleBatchExport}
            disabled={selectedRows.length === 0}
          >
            批量导出选中
          </Button>
        </Space>
      </div>

      {/* 表格区域 */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.pageSize,
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
        onSuccess={() => loadUsers()}
      />
    </ContainerBody>
  );
}
