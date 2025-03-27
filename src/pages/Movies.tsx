
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Movie, MovieCategory, XtreamCredentials } from "@/lib/types";
import { fetchAllMovies, storeMovieForPlayback } from "@/lib/mediaService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/utils";
import Layout from "@/components/Layout";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Movies = () => {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
  
  // Get credentials from localStorage
  const getCredentials = (): XtreamCredentials | null => {
    const playlist = localStorage.getItem("iptv-playlist");
    if (!playlist) return null;
    
    const parsedPlaylist = safeJsonParse(playlist, null);
    return parsedPlaylist?.credentials || null;
  };
  
  const credentials = getCredentials();
  
  // Fetch movies
  const { data: movieCategories, isLoading, error } = useQuery({
    queryKey: ["movies", credentials?.server],
    queryFn: async () => {
      if (!credentials) {
        throw new Error("No Xtream credentials found");
      }
      return fetchAllMovies(credentials);
    },
    enabled: !!credentials,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load movies: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, [error]);

  // Set initial category and movies when data loads
  useEffect(() => {
    if (movieCategories && movieCategories.length > 0) {
      if (!activeCategory) {
        setActiveCategory(movieCategories[0].id);
        setDisplayedMovies(movieCategories[0].movies);
      } else {
        const category = movieCategories.find(cat => cat.id === activeCategory);
        if (category) {
          setDisplayedMovies(category.movies);
        }
      }
    }
  }, [movieCategories, activeCategory]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    
    if (movieCategories) {
      const category = movieCategories.find(cat => cat.id === categoryId);
      if (category) {
        setDisplayedMovies(category.movies);
      }
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (movieCategories) {
      if (query.trim()) {
        // Search across all categories
        let results: Movie[] = [];
        movieCategories.forEach(category => {
          results = [
            ...results,
            ...category.movies.filter(movie =>
              movie.name.toLowerCase().includes(query.toLowerCase())
            ),
          ];
        });
        setDisplayedMovies(results);
      } else if (activeCategory) {
        // Show current category when search is cleared
        const category = movieCategories.find(cat => cat.id === activeCategory);
        if (category) {
          setDisplayedMovies(category.movies);
        }
      }
    }
  };
  
  // Handle play button
  const handlePlayMovie = (movie: Movie) => {
    if (!movie) {
      toast.error("No movie selected");
      return;
    }
    
    try {
      // Store just this specific movie for playback
      storeMovieForPlayback(movie);
      
      // Navigate to movie player
      navigate(`/movie/${movie.id}`);
    } catch (error) {
      console.error("Error preparing movie for playback:", error);
      toast.error("Failed to prepare movie for playback");
    }
  };

  if (!credentials) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center min-h-screen">
        <p className="text-lg mb-4">No Xtream Codes credentials found</p>
        <p className="text-muted-foreground mb-6">
          Please load a playlist with Xtream Codes credentials to access movies
        </p>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => navigate("/")}
        >
          Go to Playlist
        </button>
      </div>
    );
  }
  
  return (
    <Layout withSidebar fullHeight maxWidth="full" className="bg-black text-white">
      {/* Sidebar Categories */}
      <div className="w-64 border-r border-gray-800 bg-black min-h-screen p-4 flex-shrink-0">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate("/")}
            className="mr-2 p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">All Movies</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full bg-gray-800" />
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {movieCategories?.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryChange(category.id)}
                  className={cn(
                    "w-full text-left py-2 px-3 rounded-md text-sm transition-colors hover:bg-gray-800",
                    activeCategory === category.id ? "bg-gray-800 font-medium" : "text-gray-400"
                  )}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {searchQuery
              ? `Search Results: "${searchQuery}"`
              : activeCategory && movieCategories
                ? movieCategories.find(c => c.id === activeCategory)?.name || "All Movies"
                : "All Movies"}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="bg-gray-800 border-gray-700 pl-9 text-white w-64 h-9"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <button className="bg-gray-800 p-2 rounded-md">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="sr-only">Filter</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-64 w-full rounded-md bg-gray-800" />
                <Skeleton className="h-4 w-3/4 rounded bg-gray-800" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {displayedMovies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-400">
                  {searchQuery ? "No movies found matching your search" : "No movies available in this category"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {displayedMovies.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="group cursor-pointer"
                    onClick={() => handlePlayMovie(movie)}
                  >
                    <div className="aspect-[2/3] relative rounded-md overflow-hidden mb-2">
                      {movie.logo ? (
                        <img
                          src={movie.logo}
                          alt={movie.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center">
                        <button className="bg-white text-black font-medium mb-4 py-2 px-6 rounded hover:bg-gray-200 transition-colors">
                          Play
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-sm line-clamp-1">{movie.name}</h3>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      {movie.year && <span>{movie.year}</span>}
                      {movie.duration && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{movie.duration} min</span>
                        </>
                      )}
                      {movie.rating && (
                        <>
                          <span className="mx-1">•</span>
                          <span>⭐ {movie.rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Movies;
