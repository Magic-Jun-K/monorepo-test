import { SearchItem } from '@eggshell/antd-ui';

// 搜索项配置 - 与表格列一一对应
export const SEARCH_ITEMS: SearchItem[] = [
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
    label: '手机号码',
    name: 'phoneNumber',
    type: 'input',
    placeholder: '请输入手机号码'
  },
  {
    label: '注册时间范围',
    name: 'registerTime',
    type: 'rangePicker',
    placeholder: ['开始注册时间', '结束注册时间']
  },
  {
    label: '状态',
    name: 'status',
    type: 'select',
    options: [
      { label: '启用', value: '启用' },
      { label: '禁用', value: '禁用' }
    ],
    placeholder: '请选择状态'
  },
  {
    label: '角色',
    name: 'role',
    type: 'select',
    options: [
      { label: '管理员', value: '管理员' },
      { label: '普通用户', value: '普通用户' }
    ],
    placeholder: '请选择角色'
  }
];

interface DataType {
  key: string;
  name: string;
  userId: number;
  address: string;
  tags: string[];
  createTime: string;
}

export const COLUMNS = [
  {
    // 类型：Text
    // 说明：唯一标识
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId',
    width: 140,
    sorter: (a: DataType, b: DataType) => a.userId - b.userId
  },
  {
    // 类型：Text
    // 说明：用户名称
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    // 类型：Avatar
    // 说明：图片展示（点击可预览）
    title: '头像',
    dataIndex: 'profilePicture',
    key: 'profilePicture'
  },
  {
    // 类型：Text
    // 说明：邮箱地址
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    // 类型：Text
    // 说明：手机号码
    title: '手机号码',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber'
  },
  {
    // 类型：Tag
    // 说明：男/女/保密
    title: '性别',
    dataIndex: 'gender',
    key: 'gender'
  },
  {
    // 类型：Text
    // 说明：格式化日期
    title: '注册时间',
    dataIndex: 'registerTime',
    key: 'registerTime'
  },
  {
    // 类型：Text
    // 说明：格式化日期
    title: '最近登录时间',
    dataIndex: 'recentLoginTime',
    key: 'recentLoginTime'
  },
  {
    // 类型：Switch
    // 说明：启用/禁用（可切换）
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    // 类型：Text
    // 说明：用户角色
    title: '角色',
    dataIndex: 'role',
    key: 'role'
  },
  {
    // 类型：Tooltip
    // 说明：长文本显示为省略号
    title: '备注',
    dataIndex: 'remarks',
    key: 'remarks'
  },
  {
    // 类型：AttachmentList
    // 说明：显示附件链接（点击下载）
    title: '附件',
    dataIndex: 'attachment',
    key: 'attachment'
  },
  {
    // 类型：Action
    // 说明：编辑/删除按钮
    title: '操作',
    dataIndex: 'operate',
    key: 'operate'
  }
];
