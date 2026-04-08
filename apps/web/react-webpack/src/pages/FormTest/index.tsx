import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { SearchCom, TableCom } from '@eggshell/ui-antd';
import { Button } from '@eggshell/ui-tailwind';
import ContainerBody from '@/layout/ContainerBody';

import ImageTestModal from './components/ImageTestModal';
import FormTestModal from './components/FormTestModal';
import EChartsTestModal from './components/EChartsTestModal';

import { COLUMNS, SEARCH_ITEMS, PerformanceDataType } from './constant';

interface FetchParams {
  current?: number | undefined;
  pageSize?: number | undefined;
  project?: string;
  url?: string;
  browser?: string;
  status?: string;
  metricType?: string;
  timeRange?: [string, string];
}

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
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({}); // 搜索参数状态

  // 获取性能指标列表
  const fetchPerformanceList = useCallback(async (params: FetchParams = {}) => {
    setLoading(true);
    try {
      const { current = 1, pageSize = 20, ...searchFilters } = params;

      // 构建查询参数
      const queryParams = new URLSearchParams();
      queryParams.append('page', current.toString());
      queryParams.append('pageSize', pageSize.toString());

      if (searchFilters.project) queryParams.append('projectId', searchFilters.project);
      if (searchFilters.url) queryParams.append('url', searchFilters.url);
      if (searchFilters.browser) queryParams.append('browser', searchFilters.browser);
      if (searchFilters.status) queryParams.append('status', searchFilters.status);
      if (searchFilters.metricType) queryParams.append('metricType', searchFilters.metricType);

      // 处理时间范围
      if (searchFilters.timeRange && searchFilters.timeRange.length === 2) {
        queryParams.append(
          'startDate',
          dayjs(searchFilters.timeRange[0]).startOf('day').toISOString(),
        );
        queryParams.append('endDate', dayjs(searchFilters.timeRange[1]).endOf('day').toISOString());
      }

      const response = await fetch(
        `http://localhost:7002/v1/ingest/performance/list?${queryParams.toString()}`,
      );
      const res = await response.json();

      // 兼容后端返回格式 { list: [], total: 0 }
      const listData = res.list || (Array.isArray(res) ? res : []);
      const totalCount = res.total || listData.length;

      const realData: PerformanceDataType[] = listData.map((item: Record<string, unknown>) => ({
        id: item._id as string,
        project: item.projectId as string,
        url: item.url as string,
        browser: item.browser as string,
        fcp: item.fcp as number,
        lcp: item.lcp as number,
        cls: item.cls as number,
        inp: item.inp as number,
        status: (item.status as string) ?? '-',
        timestamp: dayjs(item.timestamp as string).format('YYYY-MM-DD HH:mm:ss'),
      }));

      setPerformanceList(realData);
      setPagination((prev) => ({
        ...prev,
        current,
        pageSize,
        total: totalCount,
      }));
    } catch (error) {
      console.error('获取性能指标列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformanceList({ current: 1, pageSize: 20 });
  }, [fetchPerformanceList]);

  // 处理搜索事件
  const handleSearch = useCallback(
    async (values: Record<string, unknown>) => {
      console.log('搜索参数:', values);
      setSearchParams(values);
      // 搜索时重置到第一页
      await fetchPerformanceList({ ...values, current: 1, pageSize: pagination.pageSize });
    },
    [fetchPerformanceList, pagination.pageSize],
  );

  // 处理重置事件
  const handleReset = useCallback(() => {
    // 重置数据源或重新加载数据
    console.log('重置搜索');
    setSearchParams({});
    fetchPerformanceList({ current: 1, pageSize: 20 });
  }, [fetchPerformanceList]);

  // 表格分页变化处理
  const handleTableChange = (newPagination: {
    current?: number;
    pageSize?: number;
    total?: number;
  }) => {
    fetchPerformanceList({
      ...searchParams,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
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
