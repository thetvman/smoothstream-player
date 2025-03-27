
import React, { memo } from "react";
import { Movie, MovieCategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import MovieGrid from "./MovieGrid";
import { useMovieFiltering } from "@/hooks/useMovieFiltering";

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
    setSearchQuery,
    currentCategory,
    setCurrentCategory,
    filteredMovies
  } = useMovieFiltering(movieCategories);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setSearchQuery("");
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
          onChange={(e) => setSearchQuery(e.target.value)}
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
});

MovieList.displayName = "MovieList";

export default MovieList;
