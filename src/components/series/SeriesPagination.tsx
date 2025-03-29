
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

interface SeriesPaginationProps {
  paginatedSeries: PaginatedSeries;
  onPageChange: (page: number) => void;
}

const SeriesPagination: React.FC<SeriesPaginationProps> = ({
  paginatedSeries,
  onPageChange
}) => {
  if (paginatedSeries.totalPages <= 1) return null;
  
  return (
    <div className="w-full mt-8 pb-6">
      <Pagination>
        <PaginationContent>
          {/* Previous page button */}
          {paginatedSeries.currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(paginatedSeries.currentPage - 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
          
          {/* First page */}
          {paginatedSeries.currentPage > 2 && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(1)}
                className="cursor-pointer"
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}
          
          {/* Ellipsis for many pages */}
          {paginatedSeries.currentPage > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          
          {/* Previous page */}
          {paginatedSeries.currentPage > 1 && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(paginatedSeries.currentPage - 1)}
                className="cursor-pointer"
              >
                {paginatedSeries.currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          {/* Current page */}
          <PaginationItem>
            <PaginationLink 
              isActive 
              className="cursor-pointer"
            >
              {paginatedSeries.currentPage}
            </PaginationLink>
          </PaginationItem>
          
          {/* Next page */}
          {paginatedSeries.currentPage < paginatedSeries.totalPages && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(paginatedSeries.currentPage + 1)}
                className="cursor-pointer"
              >
                {paginatedSeries.currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          {/* Ellipsis for many pages */}
          {paginatedSeries.currentPage < paginatedSeries.totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          
          {/* Last page */}
          {paginatedSeries.currentPage < paginatedSeries.totalPages - 1 && (
            <PaginationItem>
              <PaginationLink 
                onClick={() => onPageChange(paginatedSeries.totalPages)}
                className="cursor-pointer"
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
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
      
      <div className="text-xs text-center text-muted-foreground mt-2">
        Showing {(paginatedSeries.currentPage - 1) * paginatedSeries.itemsPerPage + 1}-
        {Math.min(paginatedSeries.currentPage * paginatedSeries.itemsPerPage, paginatedSeries.totalItems)} of {paginatedSeries.totalItems} series
      </div>
    </div>
  );
};

export default SeriesPagination;
