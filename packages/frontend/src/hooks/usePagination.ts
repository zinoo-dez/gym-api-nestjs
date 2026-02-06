import { useState, useCallback } from "react";

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  reset: () => void;
}

export function usePagination(initialLimit: number = 10): UsePaginationReturn {
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1); // Reset to first page when limit changes
  }, []);

  const handleSetTotal = useCallback(
    (newTotal: number) => {
      setTotal(newTotal);
      setTotalPages(Math.ceil(newTotal / limit));
    },
    [limit],
  );

  const nextPage = useCallback(() => {
    setPageState((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPageState((prev) => Math.max(prev - 1, 1));
  }, []);

  const reset = useCallback(() => {
    setPageState(1);
    setTotal(0);
    setTotalPages(0);
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setTotal: handleSetTotal,
    nextPage,
    prevPage,
    canGoNext: page < totalPages,
    canGoPrev: page > 1,
    reset,
  };
}
