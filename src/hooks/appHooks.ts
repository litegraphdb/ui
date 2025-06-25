import { tablePaginationConfig } from '@/constants/pagination';
import { useState } from 'react';

export const usePagination = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(tablePaginationConfig.pageSize);
  const [skip, setSkip] = useState(0);

  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
    setSkip((page - 1) * pageSize);
  };

  return { page, pageSize, skip, handlePageChange };
};
