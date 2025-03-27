import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie, MovieCategory } from "@/lib/types";
import { storeMovieForPlayback, clearOldMovieData } from "@/lib/mediaService";
import MovieList from "@/components/MovieList";
import MovieDetails from "@/components/MovieDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Tv, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getMoviesByCategory, getMovieDetails, searchMovies } from "@/lib/tmdbService";

const Movies = () => {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movieCategories, setMovieCategories] = useState<MovieCategory[]>([]);
  
  // Fetch movie categories
  const { isLoading: isLoadingPopular } = useQuery({
    queryKey: ["movies", "popular"],
    queryFn: async () => {
      const popularMovies = await getMoviesByCategory("Popular");
      
      if (popularMovies.length > 0) {
        setMovieCategories(prev => {
          // Check if this category already exists
          const exists = prev.some(cat => cat.name === "Popular");
          if (exists) {
            return prev.map(cat => 
              cat.name === "Popular" ? { ...cat, movies: popularMovies } : cat
            );
          } else {
            return [...prev, { id: "popular", name: "Popular", movies: popularMovies }];
          }
        });
      }
      
      return popularMovies;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch top rated movies
  const { isLoading: isLoadingTopRated } = useQuery({
    queryKey: ["movies", "top-rated"],
    queryFn: async () => {
      const topRatedMovies = await getMoviesByCategory("Top Rated");
      
      if (topRatedMovies.length > 0) {
        setMovieCategories(prev => {
          const exists = prev.some(cat => cat.name === "Top Rated");
          if (exists) {
            return prev.map(cat => 
              cat.name === "Top Rated" ? { ...cat, movies: topRatedMovies } : cat
            );
          } else {
            return [...prev, { id: "top-rated", name: "Top Rated", movies: topRatedMovies }];
          }
        });
      }
      
      return topRatedMovies;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch now playing movies
  const { isLoading: isLoadingNowPlaying } = useQuery({
    queryKey: ["movies", "now-playing"],
    queryFn: async () => {
      const nowPlayingMovies = await getMoviesByCategory("Now Playing");
      
      if (nowPlayingMovies.length > 0) {
        setMovieCategories(prev => {
          const exists = prev.some(cat => cat.name === "Now Playing");
          if (exists) {
            return prev.map(cat => 
              cat.name === "Now Playing" ? { ...cat, movies: nowPlayingMovies } : cat
            );
          } else {
            return [...prev, { id: "now-playing", name: "Now Playing", movies: nowPlayingMovies }];
          }
        });
      }
      
      return nowPlayingMovies;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch upcoming movies
  const { isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ["movies", "upcoming"],
    queryFn: async () => {
      const upcomingMovies = await getMoviesByCategory("Upcoming");
      
      if (upcomingMovies.length > 0) {
        setMovieCategories(prev => {
          const exists = prev.some(cat => cat.name === "Upcoming");
          if (exists) {
            return prev.map(cat => 
              cat.name === "Upcoming" ? { ...cat, movies: upcomingMovies } : cat
            );
          } else {
            return [...prev, { id: "upcoming", name: "Upcoming", movies: upcomingMovies }];
          }
        });
      }
      
      return upcomingMovies;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Search movies
  const { refetch: searchMoviesRefetch, isLoading: isSearching } = useQuery({
    queryKey: ["movies", "search", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      const results = await searchMovies(searchQuery);
      
      if (results.length > 0) {
        setMovieCategories(prev => {
          const exists = prev.some(cat => cat.name === "Search Results");
          if (exists) {
            return prev.map(cat => 
              cat.name === "Search Results" ? { ...cat, movies: results } : cat
            );
          } else {
            return [...prev, { id: "search-results", name: "Search Results", movies: results }];
          }
        });
      }
      
      return results;
    },
    enabled: false, // Don't run automatically
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  
  // Fetch movie details
  const { refetch: fetchMovieDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["movie-details", selectedMovie?.id],
    queryFn: async () => {
      if (selectedMovie?.tmdb_id) {
        const details = await getMovieDetails(selectedMovie.tmdb_id);
        if (details) {
          // Keep the original URL if it exists
          if (selectedMovie.url) {
            details.url = selectedMovie.url;
          }
          setSelectedMovie(details);
        }
        return details;
      }
      return null;
    },
    enabled: false, // Don't run automatically
  });
  
  // Effect to search when query changes
  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        searchMoviesRefetch();
      }, 500); // Debounce
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchMoviesRefetch]);
  
  // Effect to fetch details when movie is selected
  useEffect(() => {
    if (selectedMovie?.tmdb_id) {
      fetchMovieDetails();
    }
  }, [selectedMovie?.id]); // Only run when the ID changes
  
  // Clean up storage on component mount
  useEffect(() => {
    clearOldMovieData();
  }, []);
  
  // Handle movie selection
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setActiveTab("details");
  };
  
  // Handle play button
  const handlePlayMovie = (movie: Movie) => {
    if (!movie) {
      toast.error("No movie selected");
      return;
    }
    
    // For TMDB movies without a URL, show a message
    if (!movie.url) {
      toast.info("This is a TMDB preview. Please load your IPTV playlist to stream movies.");
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
  
  const isLoading = isLoadingPopular || isLoadingTopRated || isLoadingNowPlaying || isLoadingUpcoming;
  
  return (
    <div className="container mx-auto p-4 max-w-7xl h-dvh flex flex-col">
      <div className="flex items-center mb-4 gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="btn-icon"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="ml-2">Back</span>
          </button>
          
          <h1 className="text-2xl font-bold">Movies</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate("/series")}
            className="btn-icon"
          >
            <Tv className="w-5 h-5" />
            <span className="ml-2">TV Series</span>
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            className="pl-9"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-1 h-[calc(100vh-12rem)]">
          <MovieList 
            movieCategories={movieCategories}
            selectedMovie={selectedMovie}
            onSelectMovie={handleSelectMovie}
            isLoading={isLoading || isSearching}
          />
        </div>
        
        <div className="md:col-span-2 md:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="h-[calc(100vh-16rem)]">
              <MovieList 
                movieCategories={movieCategories}
                selectedMovie={selectedMovie}
                onSelectMovie={handleSelectMovie}
                isLoading={isLoading || isSearching}
              />
            </TabsContent>
            
            <TabsContent value="details" className="h-[calc(100vh-16rem)]">
              <MovieDetails 
                movie={selectedMovie}
                onPlay={handlePlayMovie}
                isLoading={isLoadingDetails && !!selectedMovie}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="hidden md:block md:col-span-2 border rounded-lg h-[calc(100vh-12rem)]">
          <MovieDetails 
            movie={selectedMovie}
            onPlay={handlePlayMovie}
            isLoading={isLoadingDetails && !!selectedMovie}
          />
        </div>
      </div>
    </div>
  );
};

export default Movies;
