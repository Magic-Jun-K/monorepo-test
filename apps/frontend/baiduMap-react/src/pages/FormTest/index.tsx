import { useState } from 'react';
import { Button, Table } from '@common/ui';

import ImageTestModal from './components/ImageTestModal';
import FormTestModal from './components/FormTestModal';
import EChartsTestModal from './components/EChartsTestModal';

import styles from './index.module.scss';

export default () => {
  const [isOpenImage, setIsOpenImage] = useState(false); // 是否打开ECharts模态框
  const [isOpenECharts, setIsOpenECharts] = useState(false); // 是否打开ECharts模态框
  const [isOpenForm, setIsOpenForm] = useState(false); // 是否打开表单模态框

  return (
    <div className={styles.container}>
      <div style={{ paddingBottom: '20px' }}>
        <Button variant="primary" onClick={() => setIsOpenImage(true)}>
          图片测试按钮
        </Button>
        <Button variant="primary" onClick={() => setIsOpenECharts(true)}>
          ECharts测试按钮
        </Button>
        <Button variant="primary" onClick={() => setIsOpenForm(true)}>
          表单测试按钮
        </Button>
      </div>

      <Table
        columns={[
          {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            width: 200
          },
          {
            key: 'age',
            title: 'Age',
            dataIndex: 'age',
            width: 100,
            align: 'right'
          },
          {
            key: 'address',
            title: 'Address',
            dataIndex: 'address'
          }
        ]}
        dataSource={[
          { name: 'John Doe', age: 32, address: 'New York' },
          { name: 'Jane Smith', age: 28, address: 'San Francisco' },
          { name: 'Bob Johnson', age: 45, address: 'Chicago' }
        ]}
        rowKey="name"
        pagination
      />
      <ImageTestModal visible={isOpenImage} onCancel={() => setIsOpenImage(false)} />
      <FormTestModal visible={isOpenForm} onCancel={() => setIsOpenForm(false)} />
      <EChartsTestModal visible={isOpenECharts} onCancel={() => setIsOpenECharts(false)} />
    </div>
  );
};
