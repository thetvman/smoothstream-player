
import React, { useState } from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Tv, Star } from "lucide-react";
import { paginateItems } from "@/lib/paginationUtils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface SeriesSuggestionsProps {
  suggestions: Series[];
  onSelectSeries: (series: Series) => void;
}

const SeriesSuggestions: React.FC<SeriesSuggestionsProps> = ({ suggestions, onSelectSeries }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 18;
  
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const paginatedSuggestions = paginateItems(
    suggestions,
    currentPage,
    ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of suggestions container
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-3">
        {paginatedSuggestions.items.map((series, index) => (
          <motion.div 
            key={series.id} 
            className="cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                delay: index * 0.03,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            onClick={() => onSelectSeries(series)}
          >
            <div className="relative aspect-[2/3] bg-black rounded-lg overflow-hidden mb-2 shadow-md group-hover:shadow-lg transition-all duration-300">
              {series.logo ? (
                <img 
                  src={series.logo} 
                  alt={series.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <Tv className="h-8 w-8 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
                <motion.div 
                  className="bg-primary text-white p-1.5 rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Tv className="h-4 w-4" />
                </motion.div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-xs truncate text-white group-hover:text-primary transition-colors duration-300">{series.name}</h3>
              <div className="flex text-[10px] text-gray-400 gap-2">
                {series.year && <span>{series.year}</span>}
                {series.rating && <span className="flex items-center"><Star className="h-2.5 w-2.5 text-yellow-500 mr-0.5" /> {series.rating}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      {paginatedSuggestions.totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                </PaginationItem>
              )}
              
              {Array.from({ length: paginatedSuggestions.totalPages }).map((_, i) => {
                const page = i + 1;
                // Show limited page numbers with ellipsis for better UX
                if (
                  page === 1 ||
                  page === paginatedSuggestions.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (page === currentPage - 2 && currentPage > 3) ||
                  (page === currentPage + 2 && currentPage < paginatedSuggestions.totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <span className="flex h-9 w-9 items-center justify-center">...</span>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              {currentPage < paginatedSuggestions.totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default SeriesSuggestions;
