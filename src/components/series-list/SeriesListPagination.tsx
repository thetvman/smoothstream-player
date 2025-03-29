
import React from "react";
import { PaginatedSeries } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

interface SeriesListPaginationProps {
  paginatedSeries: PaginatedSeries;
  onPageChange: (page: number) => void;
}

const SeriesListPagination: React.FC<SeriesListPaginationProps> = ({
  paginatedSeries,
  onPageChange
}) => {
  if (paginatedSeries.totalPages <= 1) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <Pagination>
        <PaginationContent className="bg-black/20 p-1 rounded-lg">
          {/* Previous page button */}
          {paginatedSeries.currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(paginatedSeries.currentPage - 1)}
                className="cursor-pointer bg-transparent hover:bg-white/10 text-white border-0"
              />
            </PaginationItem>
          )}
          
          {/* First page */}
          {paginatedSeries.currentPage > 2 && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(1)}
                className="cursor-pointer bg-transparent hover:bg-white/10 text-white border-0"
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}
          
          {/* Ellipsis for many pages */}
          {paginatedSeries.currentPage > 3 && (
            <PaginationItem>
              <PaginationEllipsis className="text-white" />
            </PaginationItem>
          )}
          
          {/* Previous page */}
          {paginatedSeries.currentPage > 1 && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(paginatedSeries.currentPage - 1)}
                className="cursor-pointer bg-transparent hover:bg-white/10 text-white border-0"
              >
                {paginatedSeries.currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          {/* Current page */}
          <PaginationItem>
            <PaginationLink 
              isActive 
              className="cursor-pointer bg-primary text-white border-0"
            >
              {paginatedSeries.currentPage}
            </PaginationLink>
          </PaginationItem>
          
          {/* Next page */}
          {paginatedSeries.currentPage < paginatedSeries.totalPages && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(paginatedSeries.currentPage + 1)}
                className="cursor-pointer bg-transparent hover:bg-white/10 text-white border-0"
              >
                {paginatedSeries.currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          {/* Ellipsis for many pages */}
          {paginatedSeries.currentPage < paginatedSeries.totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis className="text-white" />
            </PaginationItem>
          )}
          
          {/* Last page */}
          {paginatedSeries.currentPage < paginatedSeries.totalPages - 1 && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(paginatedSeries.totalPages)}
                className="cursor-pointer bg-transparent hover:bg-white/10 text-white border-0"
              >
                {paginatedSeries.totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
          
          {/* Next page button */}
          {paginatedSeries.currentPage < paginatedSeries.totalPages && (
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(paginatedSeries.currentPage + 1)}
                className="cursor-pointer bg-transparent hover:bg-white/10 text-white border-0"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default SeriesListPagination;
