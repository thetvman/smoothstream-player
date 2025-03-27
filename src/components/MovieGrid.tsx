
import React from "react";
import { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MovieGridProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  isLoading?: boolean;
}

const MovieGrid: React.FC<MovieGridProps> = ({ 
  movies, 
  onSelectMovie,
  isLoading = false 
}) => {
  // Create loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  
  if (movies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No movies found</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map(movie => (
        <MovieCard 
          key={movie.id} 
          movie={movie} 
          onClick={onSelectMovie} 
        />
      ))}
    </div>
  );
};

export default MovieGrid;
