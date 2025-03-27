
import React, { useState, useEffect } from "react";
import { Movie, MovieCategory, PaginatedMovies } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { paginateItems } from "@/lib/paginationUtils";
import MovieGrid from "./MovieGrid";

interface MovieListProps {
  movieCategories: MovieCategory[] | null;
  selectedMovie: Movie | null;
  onSelectMovie: (movie: Movie) => void;
  isLoading?: boolean;
}

const MovieList: React.FC<MovieListProps> = ({
  movieCategories,
  selectedMovie,
  onSelectMovie,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);

  // Effect to initialize with the first category when data loads
  useEffect(() => {
    if (movieCategories && movieCategories.length > 0 && !currentCategory) {
      setCurrentCategory("all");
      
      // Combine all movies from all categories
      const allMovies = movieCategories.flatMap(cat => cat.movies);
      setFilteredMovies(allMovies);
    }
  }, [movieCategories, currentCategory]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setSearchQuery("");
    
    if (movieCategories) {
      if (categoryId === "all") {
        // Combine all movies from all categories
        const allMovies = movieCategories.flatMap(cat => cat.movies);
        setFilteredMovies(allMovies);
      } else {
        const category = movieCategories.find(cat => cat.id === categoryId);
        if (category) {
          setFilteredMovies(category.movies);
        }
      }
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (movieCategories) {
      let searchMovies: Movie[] = [];
      
      if (query.trim()) {
        // Search across all categories
        movieCategories.forEach(category => {
          searchMovies = [
            ...searchMovies,
            ...category.movies.filter(movie =>
              movie.name.toLowerCase().includes(query.toLowerCase())
            ),
          ];
        });
      } else if (currentCategory === "all") {
        // Show all movies when search is cleared
        searchMovies = movieCategories.flatMap(cat => cat.movies);
      } else if (currentCategory) {
        // Show current category when search is cleared
        const category = movieCategories.find(cat => cat.id === currentCategory);
        if (category) {
          searchMovies = category.movies;
        }
      }
      
      setFilteredMovies(searchMovies);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          className="pl-10 bg-card border-secondary focus:border-primary py-6"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      
      {/* Category tabs */}
      {renderCategoryTabs()}
      
      {/* Movies grid */}
      <MovieGrid 
        movies={filteredMovies}
        onSelectMovie={onSelectMovie}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MovieList;
