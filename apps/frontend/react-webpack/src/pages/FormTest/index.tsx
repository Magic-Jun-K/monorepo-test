import { useCallback, useEffect, useState } from 'react';

import { SearchCom, TableCom } from '@eggshell/ui-antd';
import { Button } from '@eggshell/ui-tailwind';
import ContainerBody from '@/layout/ContainerBody';

import ImageTestModal from './components/ImageTestModal';
import FormTestModal from './components/FormTestModal';
import EChartsTestModal from './components/EChartsTestModal';

import { COLUMNS, SEARCH_ITEMS, PerformanceDataType } from './constant';

export default () => {
  const [isOpenImage, setIsOpenImage] = useState(false); // 是否打开图片模态框
  const [isOpenECharts, setIsOpenECharts] = useState(false); // 是否打开ECharts模态框
  const [isOpenForm, setIsOpenForm] = useState(false); // 是否打开表单模态框
  const [performanceList, setPerformanceList] = useState<PerformanceDataType[]>([]); // 性能指标数据
  const [loading, setLoading] = useState(false); // 表格加载状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  }); // 分页信息
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // 选中的行key

  // 获取性能指标列表
  const fetchPerformanceList = useCallback(
    async (/* params: any = {} */) => {
      setLoading(true);
      try {
        // 模拟性能指标数据
        const mockData: PerformanceDataType[] = Array.from({ length: 20 }, (_, index) => ({
          id: index + 1,
          project: `project-${index + 1}`,
          url: `https://example.com/page${index + 1}`,
          browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)] as string,
          fcp: Math.floor(Math.random() * 1000) + 500,
          lcp: Math.floor(Math.random() * 2000) + 1000,
          cls: Math.random() * 0.1,
          inp: Math.random() * 100, // 将FID替换为INP
          status: [200, 404, 500][Math.floor(Math.random() * 3)] as number,
          timestamp: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
          ).toISOString(),
        }));

        setPerformanceList(mockData);
        setPagination((prev) => ({
          ...prev,
          total: 100, // 模拟总数据量
        }));
      } catch (error) {
        console.error('获取性能指标列表失败:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPerformanceList();
  }, [fetchPerformanceList]);

  // 处理搜索事件
  const handleSearch = useCallback(async (values: Record<string, unknown>) => {
    console.log('搜索参数:', values);
    // await fetchPerformanceList(values);
  }, []);

  // 处理重置事件
  const handleReset = useCallback(() => {
    // 重置数据源或重新加载数据
    console.log('重置搜索');
    // fetchPerformanceList();
  }, []);

  // 表格分页变化处理
  const handleTableChange = (pagination: {
    current?: number;
    pageSize?: number;
    total?: number;
  }) => {
    setPagination((prev) => ({
      ...prev,
      ...pagination,
    }));
    // fetchPerformanceList({
    //   page: pagination.current,
    //   pageSize: pagination.pageSize
    // });
  };

  // 表格行选择处理
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <ContainerBody className="flex flex-col">
      <SearchCom items={SEARCH_ITEMS} onSearch={handleSearch} onReset={handleReset} />
      <div className="flex pb-5">
        <Button type="primary" className="mr-3" onClick={() => setIsOpenImage(true)}>
          图片测试按钮
        </Button>
        <Button type="primary" className="mr-3" onClick={() => setIsOpenECharts(true)}>
          ECharts测试按钮
        </Button>
        <Button type="primary" onClick={() => setIsOpenForm(true)}>
          表单测试按钮
        </Button>
      </div>
      <TableCom<PerformanceDataType>
        rowKey="id"
        columns={COLUMNS}
        dataSource={performanceList}
        loading={loading}
        pagination={{
          ...pagination,
          showTotal: (total) => `共 ${total} 条`,
          style: { marginBottom: 0 },
        }}
        onChange={handleTableChange}
        rowSelection={rowSelection}
      />
      {/* 图片测试模态框 */}
      <ImageTestModal visible={isOpenImage} onCancel={() => setIsOpenImage(false)} />
      {/* 表单测试模态框 */}
      <FormTestModal visible={isOpenForm} onCancel={() => setIsOpenForm(false)} />
      {/* ECharts测试模态框 */}
      <EChartsTestModal visible={isOpenECharts} onCancel={() => setIsOpenECharts(false)} />
    </ContainerBody>
  );
};
