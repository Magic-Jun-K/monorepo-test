import axios from 'axios';

// 创建独立的 axios 实例用于监控服务
const monitorRequest = axios.create({
  baseURL: 'http://localhost:7002', // 监控服务地址
  timeout: 10000,
});

monitorRequest.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);

// 接口定义
export interface PerformanceOverview {
  pv: number;
  uv: number;
  fcp: number;
  lcp: number;
  cls: number;
  inp: number;
  ttfb: number;
}

export interface TrendData {
  time: string;
  pv: number;
  fcp: number;
  lcp: number;
  cls: number;
  inp: number;
}

export interface BrowserStats {
  name: string;
  count: number;
  percentage: number;
}

export interface SlowPage {
  url: string;
  avg_fcp: number;
  avg_lcp: number;
  avg_cls: number;
  avg_inp: number;
}

export const monitorService = {
  // 获取性能概览
  getOverview: (project: string, start?: string, end?: string): Promise<PerformanceOverview> => {
    return monitorRequest.get('/analytics/performance', { params: { project, start, end } });
  },

  // 获取性能趋势
  getTrend: (project: string, url?: string, hours: number = 24): Promise<TrendData[]> => {
    return monitorRequest.get('/analytics/trend', { params: { project, url, hours } });
  },

  // 获取浏览器分布
  getBrowserStats: (project: string): Promise<BrowserStats[]> => {
    return monitorRequest.get('/analytics/browser', { params: { project } });
  },

  // 获取慢加载页面
  getSlowestPages: (project: string, limit: number = 10): Promise<SlowPage[]> => {
    return monitorRequest.get('/analytics/slowest', { params: { project, limit } });
  },
};
