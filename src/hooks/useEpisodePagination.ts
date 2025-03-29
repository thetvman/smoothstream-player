
import { useState, useMemo } from 'react';
import { Episode } from '@/lib/types';
import { paginateItems } from '@/lib/paginationUtils';

export function useEpisodePagination(episodes: Episode[], itemsPerPage: number = 24) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginatedEpisodes = useMemo(() => 
    paginateItems(episodes, currentPage, itemsPerPage),
  [episodes, currentPage, itemsPerPage]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return {
    currentPage,
    paginatedEpisodes,
    handlePageChange,
    setCurrentPage
  };
}
