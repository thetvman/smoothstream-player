
import React from "react";
import { Play, Star, Clock } from "lucide-react";
import { Movie } from "@/lib/types";

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  return (
    <div className="movie-card" onClick={() => onClick(movie)}>
      {/* Movie Poster */}
      <div className="aspect-[2/3] w-full relative">
        {movie.backdrop ? (
          <img
            src={movie.backdrop}
            alt={movie.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}
        
        {/* Overlay with info */}
        <div className="movie-card-overlay">
          <div className="absolute top-2 right-2 bg-black/60 text-xs font-medium px-2 py-1 rounded-full flex items-center">
            {movie.rating && (
              <>
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span>{movie.rating}</span>
              </>
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-semibold line-clamp-1 text-white">{movie.name}</h3>
            <div className="flex items-center text-xs text-gray-300 space-x-2">
              {movie.year && <span>{movie.year}</span>}
              {movie.duration && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{movie.duration} min</span>
                </div>
              )}
            </div>
            <button className="mt-2 bg-primary hover:bg-primary/90 text-white text-xs rounded-full py-1 px-3 flex items-center justify-center">
              <Play className="w-3 h-3 mr-1" />
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
