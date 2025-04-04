import { useEffect } from 'react';
import { SearchCom, TableCom } from '@eggshell/antd-ui';

import ContainerBody from '@/layout/ContainerBody';
import { COLUMNS, SEARCH_ITEMS } from './constant';
import { toastStore } from '@/store/toast.store';

import styles from './index.module.scss';

function TableTest() {
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

  useEffect(() => {
    toastStore.success('欢迎使用');
  }, []);

  // 处理搜索事件
  const handleSearch = async (values: Record<string, any>) => {
    console.log('搜索参数:', values);
    try {
      const response = await fetch('/api/table/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          page: 1,
          pageSize: 10
        })
      });

      const result = await response.json();
      // 这里需要更新表格数据源
      console.log('搜索结果:', result);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  // 处理重置事件
  const handleReset = () => {
    // 重置数据源或重新加载数据
    console.log('重置搜索');
  };

  return (
    <ContainerBody className={styles['TableTestPage']}>
      <div className={styles.container}>
        <SearchCom items={SEARCH_ITEMS} onSearch={handleSearch} onReset={handleReset} />
        <TableCom
          rowKey="key"
          columns={COLUMNS}
          dataSource={[]}
          pagination={{ pageSize: 10, showTotal: total => `共 ${total} 条`, style: { marginBottom: 0 } }}
        />
      </div>
    </ContainerBody>
  );
}
export default TableTest;
