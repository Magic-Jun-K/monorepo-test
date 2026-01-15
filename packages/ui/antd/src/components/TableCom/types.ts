import { TableProps, PaginationProps } from 'antd';

export type TableComProps<T> = TableProps<T> & {
  pagination?: PaginationProps | false;
  showPagination?: boolean;
  defaultPageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
};
