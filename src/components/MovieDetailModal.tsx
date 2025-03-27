
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Movie } from "@/lib/types";
import { CalendarIcon, Clock, Star, UserIcon, Film, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: { id: number; name: string }[];
}

interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface TMDBCredits {
  cast: TMDBCast[];
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  isOpen,
  onClose,
  onPlay,
}) => {
  const [tmdbMovie, setTmdbMovie] = useState<TMDBMovie | null>(null);
  const [tmdbCast, setTmdbCast] = useState<TMDBCast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TMDB_API_KEY = "0fd8ade0f772180c8f8d651787c35e14";
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    if (isOpen && movie) {
      setIsLoading(true);
      setError(null);
      setTmdbMovie(null);
      setTmdbCast([]);

      // Extract potential year from movie name or use movie.year
      let searchQuery = movie.name;
      let yearToSearch = movie.year;
      
      // Some movie titles contain the year in parentheses
      const yearInTitle = movie.name.match(/\((\d{4})\)$/);
      if (yearInTitle) {
        searchQuery = movie.name.replace(/\s*\(\d{4}\)$/, '').trim();
        yearToSearch = yearInTitle[1];
      }
      
      // Search for the movie in TMDB
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}${yearToSearch ? `&year=${yearToSearch}` : ''}`)
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch movie data');
          return response.json();
        })
        .then(data => {
          if (data.results && data.results.length > 0) {
            // Get more details for the first result
            return fetch(`https://api.themoviedb.org/3/movie/${data.results[0].id}?api_key=${TMDB_API_KEY}`);
          } else {
            throw new Error('No movie found in TMDB');
          }
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch movie details');
          return response.json();
        })
        .then(movieData => {
          setTmdbMovie(movieData);
          
          // Fetch cast information
          return fetch(`https://api.themoviedb.org/3/movie/${movieData.id}/credits?api_key=${TMDB_API_KEY}`);
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch cast data');
          return response.json();
        })
        .then((creditsData: TMDBCredits) => {
          setTmdbCast(creditsData.cast.slice(0, 6)); // Limit to 6 cast members
          setIsLoading(false);
        })
        .catch(err => {
          console.error("TMDB API Error:", err);
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [isOpen, movie]);

  if (!movie) return null;

  const handlePlay = () => {
    onPlay(movie);
    onClose();
  };

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
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />
                </div>
              ) : tmdbMovie && tmdbMovie.poster_path ? (
                <img
                  src={`${IMAGE_BASE_URL}${tmdbMovie.poster_path}`}
                  alt={tmdbMovie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (movie.logo) {
                      (e.target as HTMLImageElement).src = movie.logo;
                    } else {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }
                  }}
                />
              ) : movie.logo ? (
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
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-20 bg-gray-800 rounded-full animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-800 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <>
                  {(tmdbMovie?.runtime || movie.duration) && (
                    <div className="flex items-center text-sm bg-gray-800 px-3 py-1 rounded-full">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{tmdbMovie?.runtime || movie.duration} min</span>
                    </div>
                  )}
                  {(tmdbMovie?.vote_average || movie.rating) && (
                    <div className="flex items-center text-sm bg-gray-800 px-3 py-1 rounded-full">
                      <Star className="mr-1 h-4 w-4" />
                      <span>{tmdbMovie?.vote_average ? (tmdbMovie.vote_average / 2).toFixed(1) : movie.rating}</span>
                    </div>
                  )}
                  {(tmdbMovie?.release_date?.substring(0, 4) || movie.year) && (
                    <div className="flex items-center text-sm bg-gray-800 px-3 py-1 rounded-full">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      <span>{tmdbMovie?.release_date?.substring(0, 4) || movie.year}</span>
                    </div>
                  )}
                  {tmdbMovie?.genres && tmdbMovie.genres.length > 0 && (
                    <div className="flex items-center text-sm bg-gray-800 px-3 py-1 rounded-full">
                      <span>{tmdbMovie.genres[0].name}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-28 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-20 w-full bg-gray-800 rounded animate-pulse"></div>
              </div>
            ) : error ? (
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {movie.description || "No detailed information available for this movie."}
                </p>
              </div>
            ) : tmdbMovie?.overview ? (
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{tmdbMovie.overview}</p>
              </div>
            ) : movie.description ? (
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{movie.description}</p>
              </div>
            ) : null}
            
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-gray-800 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div>
                <h3 className="text-lg font-medium mb-2">Cast</h3>
                <p className="text-gray-300 text-sm">Cast information not available.</p>
              </div>
            ) : tmdbCast.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium mb-2">Cast</h3>
                <div className="grid grid-cols-2 gap-2">
                  {tmdbCast.map((actor) => (
                    <div key={actor.id} className="flex items-center bg-gray-800 p-2 rounded-md">
                      {actor.profile_path ? (
                        <img 
                          src={`${IMAGE_BASE_URL}${actor.profile_path}`} 
                          alt={actor.name}
                          className="w-8 h-8 rounded-full object-cover mr-2"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const parent = (e.currentTarget as HTMLElement).parentElement;
                            if (parent) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'bg-gray-700 p-1.5 rounded-full mr-2';
                              const icon = document.createElement('div');
                              placeholder.appendChild(icon);
                              parent.insertBefore(placeholder, parent.firstChild);
                              ReactDOM.render(<UserIcon className="h-4 w-4" />, icon);
                            }
                          }}
                        />
                      ) : (
                        <div className="bg-gray-700 p-1.5 rounded-full mr-2">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{actor.name}</p>
                        <p className="text-xs text-gray-400">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            
            {!isLoading && (tmdbMovie?.genres || movie.genre) && (
              <div>
                <h3 className="text-sm font-medium mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {tmdbMovie?.genres ? 
                    tmdbMovie.genres.map((genre) => (
                      <span key={genre.id} className="bg-gray-800 text-xs px-2 py-1 rounded">
                        {genre.name}
                      </span>
                    )) : 
                    movie.genre?.split(',').map((genre, index) => (
                      <span key={index} className="bg-gray-800 text-xs px-2 py-1 rounded">
                        {genre.trim()}
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                className="w-full sm:w-auto"
                onClick={handlePlay}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : 'Watch Now'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailModal;
