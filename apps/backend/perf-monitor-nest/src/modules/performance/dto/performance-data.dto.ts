export interface NavigationTiming {
  ttfb: number;
  domContentLoaded: number;
  windowLoad: number;
  resourceCount: number;
}

export class PerformanceDataDto {
  projectId: string;
  pageId?: string;
  env: string;
  url: string;
  browser: string;
  fcp?: number;
  lcp?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  status?: number;
  timestamp: string | number | Date;
  resources?: { type: string; name: string; duration: number }[];
  navigation?: NavigationTiming;
}
