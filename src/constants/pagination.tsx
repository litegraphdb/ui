import { TablePaginationConfig } from 'antd';

export const paginationConfig = {};

export const tablePaginationConfig: TablePaginationConfig = {
  pageSizeOptions: [10, 20, 50],
  pageSize: 10,
  showSizeChanger: true,
  position: ['bottomCenter'],
  showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} of ${total}`,
};
