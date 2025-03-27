
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Movie } from "@/lib/types";
import { CalendarIcon, Clock, Star, UserIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  isOpen,
  onClose,
  onPlay,
}) => {
  if (!movie) return null;

  const handlePlay = () => {
    onPlay(movie);
    onClose();
  };

  // Mock cast data since we don't have real cast info in the API
  const mockCast = [
    { name: "Actor One", role: "Character One" },
    { name: "Actor Two", role: "Character Two" },
    { name: "Actor Three", role: "Character Three" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{movie.name}</DialogTitle>
          {movie.year && (
            <DialogDescription className="text-gray-400">
              {movie.year}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-1">
            <div className="aspect-[2/3] w-full max-w-[280px] mx-auto rounded-md overflow-hidden">
              {movie.logo ? (
                <img
                  src={movie.logo}
                  alt={movie.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <Film className="h-12 w-12 text-gray-600" />
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-3">
              {movie.duration && (
                <div className="flex items-center text-sm bg-gray-800 px-3 py-1 rounded-full">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{movie.duration} min</span>
                </div>
              )}
              {movie.rating && (
                <div className="flex items-center text-sm bg-gray-800 px-3 py-1 rounded-full">
                  <Star className="mr-1 h-4 w-4" />
                  <span>{movie.rating}</span>
                </div>
              )}
              {movie.year && (
                <div className="flex items-center text-sm bg-gray-800 px-3 py-1 rounded-full">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  <span>{movie.year}</span>
                </div>
              )}
              {movie.genre && (
                <div className="flex items-center text-sm bg-gray-800 px-3 py-1 rounded-full">
                  <span>{movie.genre.split(',')[0]}</span>
                </div>
              )}
            </div>
            
            {movie.description && (
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{movie.description}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-2">Cast</h3>
              <div className="grid grid-cols-2 gap-2">
                {mockCast.map((actor, index) => (
                  <div key={index} className="flex items-center bg-gray-800 p-2 rounded-md">
                    <div className="bg-gray-700 p-1.5 rounded-full mr-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{actor.name}</p>
                      <p className="text-xs text-gray-400">{actor.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {movie.genre && (
              <div>
                <h3 className="text-sm font-medium mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genre.split(',').map((genre, index) => (
                    <span key={index} className="bg-gray-800 text-xs px-2 py-1 rounded">
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                className="w-full sm:w-auto"
                onClick={handlePlay}
              >
                Watch Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailModal;
