export class PerformanceDataDto {
  projectId: string;
  env: string;
  url: string;
  browser: string;
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  status?: number;
  timestamp: string | number | Date;
  resources?: { type: string; name: string; duration: number }[];
}
