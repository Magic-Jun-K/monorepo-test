export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  field: string;
  order: 'ASC' | 'DESC';
}

export interface ListQueryParams extends PaginationParams, Partial<SortParams> {
  search?: string;
}
