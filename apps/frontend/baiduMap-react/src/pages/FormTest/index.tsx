import { useState } from 'react';
// import { Button /* Table */ } from '@eggshell/ui';
import { Button, Select } from '@eggshell/unocss-ui';

import ImageTestModal from './components/ImageTestModal';
import FormTestModal from './components/FormTestModal';
import EChartsTestModal from './components/EChartsTestModal';
import CanvasTable, { ColumnType } from '../../components/Table';

import styles from './index.module.scss';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

const data: DataType[] = [
  { key: '1', name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park' },
  { key: '2', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park' }
];

const columns: ColumnType<DataType>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: 200,
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    title: 'Age',
    dataIndex: 'age',
    width: 100,
    align: 'center',
    sorter: (a, b) => a.age - b.age
  },
  {
    title: 'Address',
    dataIndex: 'address',
    width: 300
  }
];
export default () => {
  const [isOpenImage, setIsOpenImage] = useState(false); // 是否打开ECharts模态框
  const [isOpenECharts, setIsOpenECharts] = useState(false); // 是否打开ECharts模态框
  const [isOpenForm, setIsOpenForm] = useState(false); // 是否打开表单模态框

  return (
    <div className={styles.container}>
      <div style={{ paddingBottom: '20px' }}>
        <Button type="primary" onClick={() => setIsOpenImage(true)}>
          图片测试按钮
        </Button>
        <Button type="primary" onClick={() => setIsOpenECharts(true)}>
          ECharts测试按钮
        </Button>
        <Button type="primary" onClick={() => setIsOpenForm(true)}>
          表单测试按钮
        </Button>
        <Select options={[{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }]} />
      </div>

      {/* <Table
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
      /> */}
      <CanvasTable columns={columns} dataSource={data} width={800} height={400} scroll={{ y: 400 }} />
      <ImageTestModal visible={isOpenImage} onCancel={() => setIsOpenImage(false)} />
      <FormTestModal visible={isOpenForm} onCancel={() => setIsOpenForm(false)} />
      <EChartsTestModal visible={isOpenECharts} onCancel={() => setIsOpenECharts(false)} />
    </div>
  );
};
