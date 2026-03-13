export interface ClickHouseConfig {
  host: string;
  port?: number;
  username: string;
  password: string;
  database: string;
}

export interface PerformanceRow {
  timestamp: string;
  project_id: string;
  url: string;
  page_id?: string;
  env?: string;
  browser?: string;
  fcp?: number;
  lcp?: number;
  inp?: number;
  cls?: number;
  ttfb?: number;
  status?: number;
  resources?: string;
  navigation?: string;
}
