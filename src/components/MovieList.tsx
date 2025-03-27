
import React, { memo } from "react";
import { Movie, MovieCategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import MovieGrid from "./MovieGrid";
import { useMoviePagination } from "@/hooks/useMoviePagination";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface MovieListProps {
  movieCategories: MovieCategory[] | null;
  selectedMovie: Movie | null;
  onSelectMovie: (movie: Movie) => void;
  isLoading?: boolean;
}

const MovieList = memo(({
  movieCategories,
  selectedMovie,
  onSelectMovie,
  isLoading = false,
}: MovieListProps) => {
  const {
    searchQuery,
    handleSearchChange,
    currentCategory,
    handleCategoryChange,
    paginatedMovies,
    currentPage,
    handlePageChange
  } = useMoviePagination(movieCategories);

  // Create categories tabs
  const renderCategoryTabs = () => {
    if (!movieCategories || movieCategories.length === 0) {
      return null;
    }

    return (
      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryChange("all")}
          className={`category-tab ${currentCategory === "all" ? "category-tab-active" : ""}`}
        >
          All
        </button>
        
        {movieCategories.map(category => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`category-tab ${currentCategory === category.id ? "category-tab-active" : ""}`}
          >
            {category.name}
          </button>
        ))}
      </div>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!paginatedMovies || paginatedMovies.totalPages <= 1) {
      return null;
    }

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {/* Show max 5 page numbers */}
          {Array.from({ length: Math.min(5, paginatedMovies.totalPages) }, (_, i) => {
            // Start page calculation
            let startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(startPage + 4, paginatedMovies.totalPages);
            
            // Adjust startPage if we're near the end
            if (endPage - startPage < 4) {
              startPage = Math.max(1, endPage - 4);
            }
            
            const pageNum = startPage + i;
            
            // Don't render beyond total pages
            if (pageNum > paginatedMovies.totalPages) {
              return null;
            }
            
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  isActive={currentPage === pageNum}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage >= paginatedMovies.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          className="pl-10 bg-card border-secondary focus:border-primary py-6"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      
      {/* Category tabs */}
      {renderCategoryTabs()}
      
      {/* Movies grid with paginated results */}
      <MovieGrid 
        movies={paginatedMovies?.items || []}
        onSelectMovie={onSelectMovie}
        isLoading={isLoading}
      />
      
      {/* Pagination controls */}
      {renderPagination()}
    </div>
  );
});

MovieList.displayName = "MovieList";

export default MovieList;
