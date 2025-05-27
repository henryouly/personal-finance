import { useState } from "react";


interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function usePagination({
  pageSize,
}: {
  pageSize: number;
}) {
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: pageSize,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const updateTotalItems = (total: number) => {
    setPagination(prev => ({
      ...prev,
      total,
      totalPages: Math.ceil(total / prev.pageSize),
      hasNextPage: total > prev.pageSize,
      hasPreviousPage: prev.page > 1,
    }));
  };

  // Function to change page
  const goToPage = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(1, Math.min(newPage, prev.totalPages)),
      hasPreviousPage: newPage > 1,
      hasNextPage: newPage < prev.totalPages,
    }));
  };

  // Function to change page size
  const setPageSize = (newPageSize: number) => {
    setPagination(prev => ({
      ...prev,
      totalPages: Math.ceil(prev.total / newPageSize),
      pageSize: Math.max(1, newPageSize),
      page: 1, // Reset to first page when changing page size
      hasPreviousPage: false,
      hasNextPage: prev.total > newPageSize,
    }));
  };

  return {
    pagination,
    goToPage,
    setPageSize,
    updateTotalItems,
    nextPage: () => pagination.hasNextPage && goToPage(pagination.page + 1),
    prevPage: () => pagination.hasPreviousPage && goToPage(pagination.page - 1),
  };
}