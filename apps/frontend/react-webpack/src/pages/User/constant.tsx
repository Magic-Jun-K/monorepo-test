import { SearchItem, Tag } from '@eggshell/antd-ui';
import { Button } from '@eggshell/unocss-ui';

// 搜索配置
export const searchItems: SearchItem[] = [
  {
    label: '用户名',
    name: 'username',
    type: 'input',
    placeholder: '请输入用户名'
  },
  {
    label: '邮箱',
    name: 'email',
    type: 'input',
    placeholder: '请输入邮箱'
  },
  {
    label: '手机号',
    name: 'phone',
    type: 'input',
    placeholder: '请输入手机号'
  },
  {
    label: '用户状态',
    name: 'status',
    type: 'select',
    placeholder: '请选择用户状态',
    options: [
      { value: 'ACTIVE', label: '活跃' },
      { value: 'INACTIVE', label: '未激活' },
      { value: 'SUSPENDED', label: '暂停' },
      { value: 'LOCKED', label: '锁定' },
      { value: 'DELETED', label: '已删除' }
    ]
  },
  {
    label: '角色',
    name: 'role',
    type: 'select',
    placeholder: '请选择角色',
    options: [
      { value: 'super_admin', label: '超级管理员' },
      { value: 'admin', label: '管理员' },
      { value: 'user', label: '普通用户' }
    ]
  },
  {
    label: '创建时间',
    name: 'createdAtRange',
    type: 'rangePicker',
    // format: 'YYYY-MM-DD',
    placeholder: ['创建开始日期', '创建结束日期']
  },
  {
    label: '更新时间',
    name: 'updatedAtRange',
    type: 'rangePicker',
    // format: 'YYYY-MM-DD',
    placeholder: ['更新开始日期', '更新结束日期']
  }
];

// 用户状态映射
export const statusMap: { [key: string]: { text: string; color: string } } = {
  ACTIVE: { text: '活跃', color: 'green' },
  INACTIVE: { text: '未激活', color: 'orange' },
  SUSPENDED: { text: '暂停', color: 'red' },
  LOCKED: { text: '锁定', color: 'red' },
  DELETED: { text: '已删除', color: 'gray' }
};

// 表格列配置基础数据
export const baseColumns: any[] = [
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
    width: 120
  },
  {
    title: '角色',
    dataIndex: 'roles',
    key: 'roles',
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 180
  }
];

// 渲染函数工具
export const renderFunctions = {
  // 状态渲染
  renderStatus: (status: string) => {
    const statusInfo = statusMap[status] || { text: status, color: 'default' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  },

  // 角色渲染
  renderRoles: (roles: any[]) => roles?.map(role => role.name).join(', ') || '',

  // 时间渲染
  renderTime: (text: string) => {
    if (!text) return '-';
    const date = new Date(text);
    if (isNaN(date.getTime())) return '-';

    // 使用 toLocaleString 方法正确处理时区转换
    // Date 对象会自动根据本地时区转换 UTC 时间
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  }
};

// 完整的表格列配置（组合基础配置和渲染函数）
export const getTableColumns = (
  handleEdit?: (record: any) => void,
  handleDelete?: (record: any) => void
): any[] => {
  const columns = baseColumns.map(col => {
    switch (col.dataIndex) {
      case 'status':
        return {
          ...col,
          render: renderFunctions.renderStatus
        };
      case 'roles':
        return {
          ...col,
          render: renderFunctions.renderRoles
        };
      case 'createdAt':
      case 'updatedAt':
        return {
          ...col,
          render: renderFunctions.renderTime
        };
      default:
        return col;
    }
  });

  // 添加操作列
  columns.push({
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    fixed: 'right' as const,
    width: 148,
    render: (_text: any, record: any): React.ReactNode => {
      return (
        <>
          <Button type="primary" size="sm" onClick={() => handleEdit?.(record)}>
            编辑
          </Button>
          <Button
            type="primary"
            danger
            size="sm"
            style={{ marginLeft: '10px' }}
            onClick={() => handleDelete?.(record)}
          >
            删除
          </Button>
        </>
      );
    }
  });

  return columns;
};
