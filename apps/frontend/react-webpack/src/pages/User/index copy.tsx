import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Form, Space, Card, Tag, Select } from '@eggshell/antd-ui';
import { Button, Input, message, Modal, Upload } from '@eggshell/unocss-ui';
import { SearchOutlined, PlusOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';

import {
  fetchUsers,
  createUser,
  importUsers,
  exportUsers,
  batchExportUsers
} from '@/services/user';
import { currentUser } from '@/services/auth';

import styles from './index.module.scss';

const { Dragger } = Upload;

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

  // 状态管理
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
  const [addForm] = Form.useForm();

  // 导入用户弹框
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

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

  // 搜索处理
  const handleSearch = () => {
    setSearchParams(prev => ({
      ...prev,
      page: 1
    }));
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      page: 1,
      pageSize: 10
    });
  };

  // 分页处理
  const handlePageChange = (page: number, pageSize: number) => {
    setSearchParams(prev => ({
      ...prev,
      page,
      pageSize
    }));
  };

  // 新增用户
  const handleAddUser = async () => {
    try {
      const values = await addForm.validateFields();
      const response = await createUser(values);
      if (response.success) {
        messageApi.success('新增用户成功');
        setAddModalVisible(false);
        addForm.resetFields();
        loadUsers();
      } else {
        messageApi.error(response.message || '新增用户失败');
      }
    } catch (error) {
      console.error('新增用户失败:', error);
      messageApi.error('新增用户失败');
    }
  };

  // 导入用户
  const handleImportUsers = async () => {
    if (fileList.length === 0) {
      messageApi.error('请选择要导入的文件');
      return;
    }

    setUploading(true);
    try {
      const response = await importUsers(fileList[0].originFileObj);
      if (response.success) {
        messageApi.success(`成功导入 ${response.data.successCount} 个用户`);
        setImportModalVisible(false);
        setFileList([]);
        loadUsers();

        if (response.data.errors && response.data.errors.length > 0) {
          messageApi.warning(`部分数据导入失败：${response.data.errors.join(', ')}`);
        }
      } else {
        messageApi.error(response.message || '导入失败');
      }
    } catch (error) {
      console.error('导入失败:', error);
      messageApi.error('导入失败');
    } finally {
      setUploading(false);
    }
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
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 150
    },
    {
      title: '用户状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap: { [key: string]: { text: string; color: string } } = {
          ACTIVE: { text: '活跃', color: 'green' },
          INACTIVE: { text: '未激活', color: 'orange' },
          SUSPENDED: { text: '暂停', color: 'red' },
          LOCKED: { text: '锁定', color: 'red' },
          DELETED: { text: '已删除', color: 'gray' }
        };
        const statusInfo = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 150,
      render: (roles: any[]) => roles?.map(role => role.name).join(', ') || ''
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString()
    }
  ];

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
    <div className={styles.container}>
      {contextHolder}
      {/* 搜索区域 */}
      <Card className={styles.searchcard}>
        <Form layout="inline">
          <Form.Item label="用户名">
            <Input
              placeholder="请输入用户名"
              value={searchParams.username}
              onChange={e => setSearchParams(prev => ({ ...prev, username: e.target.value }))}
              allowClear
            />
          </Form.Item>
          <Form.Item label="邮箱">
            <Input
              placeholder="请输入邮箱"
              value={searchParams.email}
              onChange={e => setSearchParams(prev => ({ ...prev, email: e.target.value }))}
              allowClear
            />
          </Form.Item>
          <Form.Item label="手机号">
            <Input
              placeholder="请输入手机号"
              value={searchParams.phone}
              onChange={e => setSearchParams(prev => ({ ...prev, phone: e.target.value }))}
              allowClear
            />
          </Form.Item>
          <Form.Item label="用户状态">
            <Select
              placeholder="请选择用户状态"
              value={searchParams.status}
              onChange={value => setSearchParams(prev => ({ ...prev, status: value }))}
              allowClear
              options={[
                { value: 'ACTIVE', label: '活跃' },
                { value: 'INACTIVE', label: '未激活' },
                { value: 'SUSPENDED', label: '暂停' },
                { value: 'LOCKED', label: '锁定' },
                { value: 'DELETED', label: '已删除' }
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 操作按钮区域 */}
      <Card className={styles.actioncard}>
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
      </Card>

      {/* 表格区域 */}
      <Card>
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
      </Card>

      {/* 新增用户弹框 */}
      <Modal
        title="新增用户"
        open={addModalVisible}
        onOk={handleAddUser}
        onCancel={() => {
          setAddModalVisible(false);
          addForm.resetFields();
        }}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 导入用户弹框 */}
      <Modal
        title="导入用户"
        open={importModalVisible}
        onOk={handleImportUsers}
        onCancel={() => {
          setImportModalVisible(false);
          setFileList([]);
        }}
        confirmLoading={uploading}
      >
        <div className={styles.uploadarea}>
          <Dragger
            name="file"
            multiple={false}
            beforeUpload={() => false}
            onChange={info => {
              setFileList(info.fileList.slice(-1));
            }}
            fileList={fileList}
            accept=".xlsx,.xls"
          >
            <p className="ant-upload-drag-icon">
              <ImportOutlined style={{ fontSize: 48 }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">仅支持上传 .xlsx 或 .xls 格式的 excel 文件</p>
          </Dragger>
        </div>
      </Modal>
    </div>
  );
}
