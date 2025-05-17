import { SearchCom, TableCom } from '@eggshell/antd-ui';
import { Button } from '@eggshell/unocss-ui';

import ContainerBody from '@/layout/ContainerBody';
import ImageTestModal from './components/ImageTestModal';
import FormTestModal from './components/FormTestModal';
import EChartsTestModal from './components/EChartsTestModal';
import { COLUMNS, SEARCH_ITEMS } from './constant';

import styles from './index.module.scss';
import { useState } from 'react';

export default () => {
  const [isOpenImage, setIsOpenImage] = useState(false); // 是否打开ECharts模态框
  const [isOpenECharts, setIsOpenECharts] = useState(false); // 是否打开ECharts模态框
  const [isOpenForm, setIsOpenForm] = useState(false); // 是否打开表单模态框

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
        <div style={{ paddingBottom: '20px' }}>
          <Button
            type="primary"
            style={{ marginRight: '12px' }}
            // onClick={}
          >
            新增用户信息
          </Button>
          <Button
            type="primary"
            style={{ marginRight: '12px' }}
            // onClick={}
          >
            导入用户信息
          </Button>
          <Button
            type="primary"
            style={{ marginRight: '12px' }}
            // onClick={}
          >
            导出用户信息
          </Button>
          <Button
            type="primary"
            style={{ marginRight: '12px' }}
            onClick={() => setIsOpenImage(true)}
          >
            图片测试按钮
          </Button>
          <Button
            type="primary"
            style={{ marginRight: '12px' }}
            onClick={() => setIsOpenECharts(true)}
          >
            ECharts测试按钮
          </Button>
          <Button type="primary" onClick={() => setIsOpenForm(true)}>
            表单测试按钮
          </Button>
        </div>
        <TableCom
          rowKey="key"
          columns={COLUMNS}
          dataSource={[]}
          pagination={{
            pageSize: 10,
            showTotal: total => `共 ${total} 条`,
            style: { marginBottom: 0 }
          }}
        />
      </div>
      <ImageTestModal visible={isOpenImage} onCancel={() => setIsOpenImage(false)} />
      <FormTestModal visible={isOpenForm} onCancel={() => setIsOpenForm(false)} />
      <EChartsTestModal visible={isOpenECharts} onCancel={() => setIsOpenECharts(false)} />
    </ContainerBody>
  );
};
