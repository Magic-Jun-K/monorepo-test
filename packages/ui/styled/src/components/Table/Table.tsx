import { useState, useMemo, ReactNode } from 'react';
import {
  TableWrapper,
  TableElement,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableCell,
  PaginationWrapper,
  PaginationButton,
  LoadingOverlay
} from './styles';
import { TableProps } from './types';

export const Table = <T extends object>({
  dataSource,
  columns,
  rowKey,
  pagination,
  loading,
  rowSelection,
  onRow,
  onHeaderRow
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [sortState, setSortState] = useState<{
    columnKey: string;
    order: 'ascend' | 'descend' | null;
  }>({ columnKey: '', order: null });

  const sortedData = useMemo(() => {
    if (!sortState.columnKey || !sortState.order) return dataSource;
    
    const column = columns.find(col => col.key === sortState.columnKey);
    if (!column?.sorter) return dataSource;
    
    return [...dataSource].toSorted((a, b) => {
      const result = column.sorter!(a, b);
      return sortState.order === 'ascend' ? result : -result;
    });
  }, [dataSource, sortState, columns]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.ceil(dataSource.length / pageSize);
  }, [dataSource, pageSize, pagination]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectRow = (record: T, key: string | number) => {
    if (!rowSelection) return;

    const newSelectedRowKeys = [...selectedRowKeys];
    const index = newSelectedRowKeys.indexOf(key);

    if (index === -1) {
      newSelectedRowKeys.push(key);
    } else {
      newSelectedRowKeys.splice(index, 1);
    }

    setSelectedRowKeys(newSelectedRowKeys);
    rowSelection.onChange(
      newSelectedRowKeys,
      dataSource.filter((_, i) => newSelectedRowKeys.includes(getRowKey(_, i)))
    );
  };

  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    if (rowKey) {
      const keyValue = record[rowKey as keyof T];
      if (typeof keyValue === 'string' || typeof keyValue === 'number') {
        return keyValue;
      }
      throw new Error('rowKey must return a string or number');
    }
    return index;
  };

  return (
    <TableWrapper>
      {loading && <LoadingOverlay>Loading...</LoadingOverlay>}

      <TableElement>
        <TableHead>
          <TableRow {...onHeaderRow?.(columns, 0)}>
            {rowSelection && <TableHeaderCell width={50} />}
            {columns.map(column => {
              const isSorted = sortState.columnKey === column.key;
              const sortOrder = isSorted ? sortState.order : null;
              
              return (
                <TableHeaderCell 
                  key={column.key} 
                  {...(column.width && { width: column.width })}
                  style={{ textAlign: column.align }}
                  onClick={() => {
                    if (!column.sorter) return;
                    let newOrder: 'ascend' | 'descend' | null = 'ascend';
                    if (isSorted) {
                      newOrder = sortOrder === 'ascend' ? 'descend' : null;
                    }
                    setSortState({
                      columnKey: newOrder ? column.key : '',
                      order: newOrder
                    });
                  }}
                >
                  {column.title}
                  {isSorted && (
                    <span style={{ marginLeft: 8 }}>
                      {sortOrder === 'ascend' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
              );
            })}
          </TableRow>
        </TableHead>

        <tbody>
          {paginatedData.map((record, rowIndex) => {
            const key = getRowKey(record, rowIndex);
            return (
              <TableRow key={key} {...onRow?.(record, rowIndex)}>
                {rowSelection && (
                  <TableCell>
                    <input type="checkbox" checked={selectedRowKeys.includes(key)} onChange={() => handleSelectRow(record, key)} />
                  </TableCell>
                )}

                {columns.map(column => {
                  const value = column.dataIndex ? record[column.dataIndex as keyof T] : null;
                  return (
                    <TableCell key={column.key} style={{ textAlign: column.align }}>
                      {column.render ? column.render(value as ReactNode, record, rowIndex) : (value as ReactNode)}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
      </TableElement>

      {pagination && (
        <PaginationWrapper>
          <PaginationButton disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
            Previous
          </PaginationButton>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PaginationButton key={page} disabled={page === currentPage} onClick={() => handlePageChange(page)}>
              {page}
            </PaginationButton>
          ))}

          <PaginationButton disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </PaginationButton>
        </PaginationWrapper>
      )}
    </TableWrapper>
  );
};
