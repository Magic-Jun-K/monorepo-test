import { useMemo } from 'react';
import { SearchCom, SearchItem, TableCom } from '@eggshell/antd-ui';
// import { LayoutProvider } from '@eggshell/antd-ui/src/context/LayoutContext';

import ContainerBody from '@/layout/ContainerBody';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
  createTime: string;
}

const columns = [
  {
    title: '工单号',
    dataIndex: 'businessKey',
    key: 'businessKey',
    width: 140
  },
  {
    title: '工单类型',
    dataIndex: 'orderTypeKey',
    key: 'orderTypeKey'
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
    sorter: (a: DataType, b: DataType) => a.age - b.age
  },
  {
    title: '问题地点',
    dataIndex: 'address',
    key: 'address'
  },
  {
    title: '工单状态',
    dataIndex: 'orderStatus',
    key: 'orderStatus'
  },
  {
    title: '处理结果',
    dataIndex: 'orderResult',
    key: 'orderResult'
  },
  {
    title: '当前办理人',
    dataIndex: 'currentAssignee',
    key: 'currentAssignee'
  },
  {
    title: '工单来源',
    dataIndex: 'orderSource',
    key: 'orderSource'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime'
  }
];

export default () => {
  // 模拟数据源
  // const [dataSource, setDataSource] = useState<DataType[]>([
  //   {
  //     key: '1',
  //     name: '张三',
  //     age: 32,
  //     address: '北京市朝阳区',
  //     tags: ['开发', '前端'],
  //     createTime: '2023-01-15'
  //   },
  // ]);

  // 搜索项配置 - 与表格列一一对应
  const searchItems: SearchItem[] = [
    {
      label: '工单号',
      name: 'businessKey',
      type: 'input',
      placeholder: '请输入工单号'
    },
    {
      label: '工单类型',
      name: 'orderTypeKey',
      type: 'input',
      placeholder: '请输入工单类型'
    },
    {
      label: '问题地点',
      name: 'address',
      type: 'input',
      placeholder: '请输入问题地点'
    },
    {
      label: '工单状态',
      name: 'orderStatus',
      type: 'select',
      placeholder: '请选择工单状态',
      options: [
        { label: '待处理', value: '待处理' },
        { label: '处理中', value: '处理中' },
        { label: '已完成', value: '已完成' },
        { label: '已关闭', value: '已关闭' }
      ]
    },
    {
      label: '处理结果',
      name: 'orderResult',
      type: 'select',
      placeholder: '请选择处理结果',
      options: [
        { label: '已解决', value: '已解决' },
        { label: '未解决', value: '未解决' },
        { label: '转交他人', value: '转交他人' },
        { label: '其他', value: '其他' }
      ]
    },
    {
      label: '当前办理人',
      name: 'currentAssignee',
      type: 'input',
      placeholder: '请输入当前办理人'
    },
    {
      label: '工单来源',
      name: 'orderSource',
      type: 'select',
      placeholder: '请选择工单来源',
      options: [
        { label: '电话', value: '电话' },
        { label: '网站', value: '网站' },
        { label: '邮件', value: '邮件' },
        { label: '现场', value: '现场' },
        { label: '其他', value: '其他' }
      ]
    },
    {
      label: '创建时间',
      name: 'createTime',
      type: 'rangePicker',
      placeholder: '请选择创建时间范围'
    },
    {
      label: '更新时间',
      name: 'updateTime',
      type: 'rangePicker',
      placeholder: '请选择更新时间范围'
    },
    {
      label: '优先级',
      name: 'priority',
      type: 'select',
      placeholder: '请选择优先级',
      options: [
        { label: '低', value: '低' },
        { label: '中', value: '中' },
        { label: '高', value: '高' },
        { label: '紧急', value: '紧急' }
      ]
    }
  ];

  // 处理搜索事件
  const handleSearch = (values: Record<string, any>) => {
    console.log('搜索参数:', values);
    // 使用模拟数据进行筛选
    const filteredData = data.filter(item => {
      // 工单号筛选
      if (values.businessKey && !item.businessKey.includes(values.businessKey)) {
        return false;
      }

      // 工单类型筛选
      if (values.orderTypeKey && !item.orderTypeKey.includes(values.orderTypeKey)) {
        return false;
      }

      // 问题地点筛选
      if (values.address && !item.address.includes(values.address)) {
        return false;
      }

      // 工单状态筛选
      if (values.orderStatus && item.orderStatus !== values.orderStatus) {
        return false;
      }

      // 处理结果筛选
      if (values.orderResult && item.orderResult !== values.orderResult) {
        return false;
      }

      // 当前办理人筛选
      if (values.currentAssignee && !item.currentAssignee.includes(values.currentAssignee)) {
        return false;
      }

      // 工单来源筛选
      if (values.orderSource && item.orderSource !== values.orderSource) {
        return false;
      }

      // 创建时间筛选 (假设数据中有createTime字段)
      if (values.createTime && values.createTime.length === 2) {
        const startDate = new Date(values.createTime[0]).getTime();
        const endDate = new Date(values.createTime[1]).getTime();
        // 这里假设item中有createTime字段，实际使用时需要确保数据结构匹配
        const itemDate = new Date(item.createTime || new Date()).getTime();

        if (itemDate < startDate || itemDate > endDate) {
          return false;
        }
      }

      // 更新时间筛选 (假设数据中有updateTime字段)
      if (values.updateTime && values.updateTime.length === 2) {
        const startDate = new Date(values.updateTime[0]).getTime();
        const endDate = new Date(values.updateTime[1]).getTime();
        // 这里假设item中有updateTime字段，实际使用时需要确保数据结构匹配
        const itemDate = new Date(item.updateTime || new Date()).getTime();

        if (itemDate < startDate || itemDate > endDate) {
          return false;
        }
      }

      // 优先级筛选 (假设数据中有priority字段)
      if (values.priority && item.priority !== values.priority) {
        return false;
      }

      return true;
    });

    // 更新表格数据
    console.log('筛选后数据:', filteredData);
  };

  // 处理重置事件
  const handleReset = () => {
    // 重置数据源或重新加载数据
    console.log('重置搜索');
  };
  const data = useMemo(() => {
    const _data: any[] = [];
    const orderStatuses = ['待处理', '处理中', '已完成', '已关闭'];
    const orderResults = ['已解决', '未解决', '转交他人', '其他'];
    const orderSources = ['电话', '网站', '邮件', '现场', '其他'];
    const priorities = ['低', '中', '高', '紧急'];

    for (let i = 0; i < 100; i++) {
      const createDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const updateDate = new Date(createDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);

      _data.push({
        key: i,
        businessKey: `WO-${2023}${String(i).padStart(4, '0')}`,
        orderTypeKey: `工单类型${(i % 5) + 1}`,
        address: `${['北京市', '上海市', '广州市', '深圳市', '杭州市'][i % 5]}问题地点${i}`,
        orderStatus: orderStatuses[i % orderStatuses.length],
        orderResult: orderResults[i % orderResults.length],
        currentAssignee: `办理人${(i % 10) + 1}`,
        orderSource: orderSources[i % orderSources.length],
        createTime: createDate.toISOString().split('T')[0],
        updateTime: updateDate.toISOString().split('T')[0],
        priority: priorities[i % priorities.length]
      });
    }
    return _data;
  }, []);

  return (
    <ContainerBody>
      {/* <LayoutProvider> */}
        <SearchCom items={searchItems} onSearch={handleSearch} onReset={handleReset} />
        <TableCom rowKey="key" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
      {/* </LayoutProvider> */}
    </ContainerBody>
  );
};
