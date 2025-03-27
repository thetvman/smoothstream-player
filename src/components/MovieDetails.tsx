
import React from "react";
import { Movie } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Star, Film, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MovieDetailsProps {
  movie: Movie | null;
  onPlay: (movie: Movie) => void;
  isLoading?: boolean;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onPlay, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-6 h-full">
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
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-card/50 rounded-xl backdrop-blur-sm">
        <Film className="h-20 w-20 text-muted-foreground mb-6 opacity-50" />
        <h3 className="text-2xl font-medium mb-3">No Movie Selected</h3>
        <p className="text-muted-foreground max-w-md">
          Select a movie from the list to see details and start streaming
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden group">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10">
        {movie.backdrop ? (
          <img
            src={movie.backdrop}
            alt=""
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card to-card/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 h-full z-10">
        {/* Header with movie title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{movie.name}</h1>
          
          {/* Movie metadata in pills */}
          <div className="flex flex-wrap gap-3 mb-4">
            {movie.year && (
              <div className="flex items-center text-sm bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-full">
                <CalendarIcon className="mr-1 h-4 w-4" />
                <span>{movie.year}</span>
              </div>
            )}
            {movie.duration && (
              <div className="flex items-center text-sm bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-full">
                <Clock className="mr-1 h-4 w-4" />
                <span>{movie.duration} min</span>
              </div>
            )}
            {movie.rating && (
              <div className="flex items-center text-sm bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-full">
                <Star className="mr-1 h-4 w-4" />
                <span>{movie.rating}</span>
              </div>
            )}
            {movie.genre && (
              <div className="flex items-center text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                {movie.genre}
              </div>
            )}
            {movie.group && (
              <div className="flex items-center text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                {movie.group}
              </div>
            )}
          </div>
        </div>

        {/* Movie poster and description section */}
        <div className="flex-1 overflow-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Movie poster/logo */}
          <div className={cn(
            "relative rounded-lg overflow-hidden bg-card shadow-lg h-64 md:h-auto",
            !movie.logo && !movie.backdrop ? "flex items-center justify-center" : ""
          )}>
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
              <Film className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          
          {/* Movie details */}
          <div className="md:col-span-2 space-y-4">
            {movie.description && (
              <div>
                <h3 className="text-lg font-medium mb-2">Synopsis</h3>
                <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Play button */}
        <div className="mt-auto">
          <Button 
            className="w-full sm:w-auto group relative overflow-hidden"
            size="lg"
            onClick={() => onPlay(movie)}
          >
            <span className="flex items-center justify-center">
              <Play className="w-5 h-5 mr-2" />
              Play Movie
            </span>
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
