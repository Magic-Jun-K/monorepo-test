import { useMemo } from 'react';
import { SearchCom, TableCom } from '@eggshell/antd-ui';

import ContainerBody from '@/layout/ContainerBody';
import { COLUMNS, SEARCH_ITEMS } from './constant';

import styles from './index.module.scss';

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

  // 处理搜索事件
  const handleSearch = (values: Record<string, any>) => {
    console.log('搜索参数:', values);
    // 使用模拟数据进行筛选
    const filteredData = data.filter(item => {
      // 用户ID筛选
      if (values.userId && !item.userId.includes(values.userId)) {
        return false;
      }

      // 用户名筛选
      if (values.username && !item.username.includes(values.username)) {
        return false;
      }

      // 状态筛选
      if (values.status && !item.status.includes(values.status)) {
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

      // 金额筛选
      if (values.amount && item.amount !== values.amount) {
        return false;
      }

      // 库存数量筛选
      if (values.inventoryQuantity && item.inventoryQuantity !== values.inventoryQuantity) {
        return false;
      }

      // 分类标签筛选
      if (values.tags && !item.tags.includes(values.tags)) {
        return false;
      }

      // 是否推荐筛选
      if (values.isRecommended && item.isRecommended !== values.isRecommended) {
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
        userId: `WO-${2023}${String(i).padStart(4, '0')}`,
        username: `用户名${(i % 5) + 1}`,
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
    <ContainerBody className={styles['TableTestPage']}>
        <div className={styles.container}>
          <SearchCom items={SEARCH_ITEMS} onSearch={handleSearch} onReset={handleReset} />
          <TableCom
            rowKey="key"
            columns={COLUMNS}
            dataSource={data}
            pagination={{ pageSize: 10, showTotal: total => `共 ${total} 条`, style: { marginBottom: 0 } }}
          />
        </div>
    </ContainerBody>
  );
};
