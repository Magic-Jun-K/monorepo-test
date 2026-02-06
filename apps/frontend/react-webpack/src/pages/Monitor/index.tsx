import { useEffect, useState } from 'react';
import type { FC } from 'react';
import dayjs from 'dayjs';

import {
  Card,
  Row,
  Col,
  Statistic,
  TableCom,
  Spin,
  DashboardOutlined,
  ReloadOutlined,
} from '@eggshell/ui-antd';
import { Button } from '@eggshell/ui-tailwind';
import { EChartsCom } from '@/components/ECharts';

import {
  monitorService,
  PerformanceOverview,
  TrendData,
  BrowserStats,
  SlowPage,
} from '@/services/monitor';

const MonitorDashboard: FC = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<PerformanceOverview | null>(null);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [browserStats, setBrowserStats] = useState<BrowserStats[]>([]);
  const [slowPages, setSlowPages] = useState<SlowPage[]>([]);

  const projectId = 'react-webpack-app'; // 暂时硬编码，后续可从环境或配置获取

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ov, tr, br, sl] = await Promise.all([
        monitorService.getOverview(projectId),
        monitorService.getTrend(projectId),
        monitorService.getBrowserStats(projectId),
        monitorService.getSlowestPages(projectId),
      ]);
      setOverview(ov);
      setTrend(tr);
      setBrowserStats(br);
      setSlowPages(sl);
    } catch (error) {
      console.error('Failed to fetch monitor data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['PV', 'FCP', 'LCP', 'INP'] },
    xAxis: { type: 'category', data: trend.map((t) => dayjs(t.time).format('YYYY-MM-DD HH:mm')) },
    yAxis: [
      { type: 'value', name: 'PV', position: 'left' },
      { type: 'value', name: 'Time (ms)', position: 'right' },
    ],
    series: [
      { name: 'PV', type: 'line', data: trend.map((t) => t.pv), yAxisIndex: 0 },
      { name: 'FCP', type: 'line', data: trend.map((t) => t.fcp), yAxisIndex: 1 },
      { name: 'LCP', type: 'line', data: trend.map((t) => t.lcp), yAxisIndex: 1 },
      { name: 'INP', type: 'line', data: trend.map((t) => t.inp), yAxisIndex: 1 },
    ],
  };

  const browserOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: 'Browser',
        type: 'pie',
        radius: '50%',
        data: browserStats.map((b) => ({ value: b.count, name: b.name })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const columns = [
    { title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true },
    {
      title: 'FCP (ms)',
      dataIndex: 'avg_fcp',
      key: 'avg_fcp',
      render: (val: number) => val?.toFixed(2),
    },
    {
      title: 'LCP (ms)',
      dataIndex: 'avg_lcp',
      key: 'avg_lcp',
      render: (val: number) => val?.toFixed(2),
    },
    {
      title: 'CLS',
      dataIndex: 'avg_cls',
      key: 'avg_cls',
      render: (val: number) => val?.toFixed(4),
    },
    {
      title: 'INP (ms)',
      dataIndex: 'avg_inp',
      key: 'avg_inp',
      render: (val: number) => val?.toFixed(2),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DashboardOutlined /> 性能监控仪表盘
        </h1>
        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
          刷新
        </Button>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} className="mb-6">
          <Col style={{ width: '20%', flex: '0 0 20%' }}>
            <Card>
              <Statistic title="总浏览量 (PV)" value={overview?.pv || 0} />
            </Card>
          </Col>
          <Col style={{ width: '20%', flex: '0 0 20%' }}>
            <Card>
              <Statistic
                title="平均 FCP"
                value={overview?.fcp || 0}
                suffix="ms"
                precision={2}
                valueStyle={{ color: (overview?.fcp || 0) > 1800 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
          <Col style={{ width: '20%', flex: '0 0 20%' }}>
            <Card>
              <Statistic
                title="平均 LCP"
                value={overview?.lcp || 0}
                suffix="ms"
                precision={2}
                valueStyle={{ color: (overview?.lcp || 0) > 2500 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
          <Col style={{ width: '20%', flex: '0 0 20%' }}>
            <Card>
              <Statistic
                title="平均 CLS"
                value={overview?.cls || 0}
                precision={3}
                valueStyle={{ color: (overview?.cls || 0) > 0.1 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
          <Col style={{ width: '20%', flex: '0 0 20%' }}>
            <Card>
              <Statistic
                title="平均 INP"
                value={overview?.inp || 0}
                suffix="ms"
                precision={2}
                valueStyle={{ color: (overview?.inp || 0) > 200 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-6">
          <Col span={16}>
            <Card title="性能趋势 (24h)" variant="borderless">
              <EChartsCom options={trendOption} style={{ height: 350 }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="浏览器分布" variant="borderless">
              <EChartsCom options={browserOption} style={{ height: 350 }} />
            </Card>
          </Col>
        </Row>

        <Card title="慢加载页面 TOP 10" variant="borderless">
          <TableCom dataSource={slowPages} columns={columns} rowKey="url" pagination={false} />
        </Card>
      </Spin>
    </div>
  );
};
export default MonitorDashboard;
