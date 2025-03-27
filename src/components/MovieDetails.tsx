
import React from "react";
import { Movie } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Star, Film } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MovieDetailsProps {
  movie: Movie | null;
  onPlay: (movie: Movie) => void;
  isLoading?: boolean;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onPlay, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="flex justify-center mt-4">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Film className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No Movie Selected</h3>
        <p className="text-muted-foreground">
          Select a movie from the list to see details and play
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="relative mb-4 rounded-lg overflow-hidden h-48 bg-card">
        {movie.backdrop ? (
          <img
            src={movie.backdrop}
            alt={movie.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : movie.logo ? (
          <img
            src={movie.logo}
            alt={movie.name}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Film className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="p-4 text-white">
            <h2 className="text-xl font-bold">{movie.name}</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {movie.year && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1 h-4 w-4" />
            <span>{movie.year}</span>
          </div>
        )}
        {movie.duration && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>{movie.duration} min</span>
          </div>
        )}
        {movie.rating && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="mr-1 h-4 w-4" />
            <span>{movie.rating}</span>
          </div>
        )}
        {movie.group && (
          <div className="flex items-center text-sm bg-muted text-muted-foreground px-2 py-1 rounded-full">
            {movie.group}
          </div>
        )}
      </div>

      {movie.genre && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-1">Genre</h3>
          <p className="text-sm text-muted-foreground">{movie.genre}</p>
        </div>
      )}

      {movie.description && (
        <div className="mb-6 flex-1 overflow-auto">
          <h3 className="text-sm font-medium mb-1">Description</h3>
          <p className="text-sm text-muted-foreground">{movie.description}</p>
        </div>
      )}

      <div className="mt-auto flex justify-center">
        <Button 
          className="w-full sm:w-auto"
          size="lg"
          onClick={() => onPlay(movie)}
        >
          Play Movie
        </Button>
      </div>
    </div>
  );
};

export default MovieDetails;
