import { SearchItem, Tag } from '@eggshell/antd-ui';

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
export const baseColumns = [
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
  renderTime: (text: string) => new Date(text).toLocaleString()
};

// 完整的表格列配置（组合基础配置和渲染函数）
export const getTableColumns = () => {
  return baseColumns.map(col => {
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
};
