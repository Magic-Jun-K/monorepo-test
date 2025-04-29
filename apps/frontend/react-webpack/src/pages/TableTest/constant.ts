import { SearchItem } from '@eggshell/antd-ui';

// 搜索项配置 - 与表格列一一对应
export const SEARCH_ITEMS: SearchItem[] = [
  {
    label: '用户ID',
    name: 'userId',
    type: 'input',
    placeholder: '请输入用户ID'
  },
  {
    label: '用户名',
    name: 'username',
    type: 'input',
    placeholder: '请输入用户名'
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
    label: '创建时间',
    name: 'createTime',
    type: 'rangePicker',
    placeholder: ['开始创建时间', '结束创建时间']
  },
  {
    label: '更新时间',
    name: 'updateTime',
    type: 'rangePicker',
    placeholder: ['开始更新时间', '结束更新时间']
  },
  {
    label: '金额',
    name: 'amount',
    type: 'input',
    placeholder: '请输入金额'
  },
  {
    label: '库存数量',
    name: 'inventoryQuantity',
    type: 'input',
    placeholder: '请输入库存数量'
  },
  {
    label: '分类标签',
    name: 'tags',
    type: 'select',
    options: [
      { label: '科技', value: '科技' },
      { label: '金融', value: '金融' },
      { label: '医疗', value: '医疗' }
    ],
    placeholder: '请选择分类标签'
  },
  {
    label: '是否推荐',
    name: 'isRecommended',
    type: 'select',
    options: [
      { label: '是', value: '是' },
      { label: '否', value: '否' }
    ],
    placeholder: '请选择是否推荐'
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
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId',
    width: 140,
    sorter: (a: DataType, b: DataType) => a.userId - b.userId
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime'
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount'
  },
  {
    title: '库存数量',
    dataIndex: 'inventoryQuantity',
    key: 'inventoryQuantity'
  },
  {
    title: '缩略图',
    dataIndex: 'thumbnail',
    key: 'thumbnail'
  },
  {
    title: '附件',
    dataIndex: 'attachment',
    key: 'attachment'
  },
  {
    title: '分类标签',
    dataIndex: 'tags',
    key: 'tags'
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress'
  },
  {
    title: '是否推荐',
    dataIndex: 'isRecommended',
    key: 'isRecommended'
  },
  {
    title: '综合评分',
    dataIndex: 'comprehensiveScore',
    key: 'comprehensiveScore'
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate'
  }
];
