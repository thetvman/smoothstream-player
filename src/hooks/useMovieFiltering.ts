import { useState, useMemo } from 'react';
import { Movie, MovieCategory } from '@/lib/types';

export const useMovieFiltering = (movieCategories: MovieCategory[] | null) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  
  // Memoize all movies for better performance
  const allMovies = useMemo(() => {
    if (!movieCategories) return [];
    return movieCategories.flatMap(cat => cat.movies);
  }, [movieCategories]);
  
  // Memoize filtered movies
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
  
  return {
    searchQuery,
    setSearchQuery,
    currentCategory,
    setCurrentCategory,
    filteredMovies,
    allMovies
  };
};
