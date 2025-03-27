import { useState, useMemo } from 'react';
import { Movie, MovieCategory, PaginatedMovies } from '@/lib/types';
import { paginateItems } from '@/lib/paginationUtils';

export const useMoviePagination = (movieCategories: MovieCategory[] | null) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  // Memoize all movies for better performance
  const allMovies = useMemo(() => {
    if (!movieCategories) return [];
    return movieCategories.flatMap(cat => cat.movies);
  }, [movieCategories]);
  
  // Get filtered movies based on category and search
  const filteredMovies = useMemo(() => {
    if (!movieCategories) return [];
    
    let movies: Movie[] = [];
    const query = searchQuery.toLowerCase();
    
    // If there's a search query, search across all categories
    if (query) {
      movies = allMovies.filter(movie =>
        movie.name.toLowerCase().includes(query)
      );
    }
    // Otherwise, filter by category
    else if (currentCategory === "all") {
      movies = allMovies;
    } else if (currentCategory) {
      const category = movieCategories.find(cat => cat.id === currentCategory);
      movies = category?.movies || [];
    }
    
    return movies;
  }, [movieCategories, currentCategory, searchQuery, allMovies]);
  
  // Create paginated movies
  const paginatedMovies = useMemo(() => {
    return paginateItems<Movie>(filteredMovies, currentPage, ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage, ITEMS_PER_PAGE]);
  
  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  // Reset pagination when category or search changes
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setCurrentPage(1);
    setSearchQuery("");
  };
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  
  return {
    searchQuery,
    handleSearchChange,
    currentCategory,
    handleCategoryChange,
    paginatedMovies,
    currentPage,
    handlePageChange,
    allMovies
  };
};
