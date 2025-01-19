import styled from 'styled-components';

export const TableWrapper = styled.div`
  width: 100%;
  overflow: auto;
`;

export const TableElement = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
`;

export const TableHead = styled.thead`
  background-color: #fafafa;
`;

export const TableRow = styled.tr`
  &:hover {
    background-color: #fafafa;
  }
`;

export const TableHeaderCell = styled.th<{ width?: number | string }>`
  padding: 16px;
  text-align: left;
  font-weight: 500;
  border-bottom: 1px solid #e8e8e8;
  width: ${({ width }) => width || 'auto'};
  background-color: #fafafa;
  position: sticky;
  top: 0;
  z-index: 1;
`;

export const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
`;

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px;
`;

export const PaginationButton = styled.button`
  margin: 0 4px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    border-color: #1890ff;
    color: #1890ff;
  }
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;
