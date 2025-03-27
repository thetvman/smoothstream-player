
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Movie, MovieCategory, XtreamCredentials } from "@/lib/types";
import { fetchAllMovies, storeMovieForPlayback } from "@/lib/mediaService";
import MovieList from "@/components/MovieList";
import MovieDetails from "@/components/MovieDetails";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/utils";
import NavBar from "@/components/NavBar";
import { Skeleton } from "@/components/ui/skeleton";

const Movies = () => {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // Get credentials from localStorage with error handling
  const getCredentials = (): XtreamCredentials | null => {
    try {
      const playlist = localStorage.getItem("iptv-playlist");
      if (!playlist) return null;
      
      const parsedPlaylist = safeJsonParse(playlist, null);
      return parsedPlaylist?.credentials || null;
    } catch (error) {
      console.error("Error parsing credentials:", error);
      return null;
    }
  };
  
  const credentials = getCredentials();
  
  // Fetch movies with proper error handling and caching
  const { data: movieCategories, isLoading, error } = useQuery({
    queryKey: ["movies", credentials?.server],
    queryFn: async () => {
      if (!credentials) {
        throw new Error("No Xtream credentials found");
      }
      return fetchAllMovies(credentials);
    },
    enabled: !!credentials,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 2
  });
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error("Failed to load movies: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, [error]);
  
  // Optimized movie selection handler
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(prev => prev?.id === movie.id ? null : movie);
  };
  
  // Optimized play handler with error boundary
  const handlePlayMovie = async (movie: Movie) => {
    if (!movie) {
      toast.error("No movie selected");
      return;
    }
    
    try {
      await storeMovieForPlayback(movie);
      navigate(`/movie/${movie.id}`);
    } catch (error) {
      console.error("Error preparing movie for playback:", error);
      toast.error("Failed to prepare movie for playback");
    }
  };
  
  if (!credentials) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex flex-col items-center justify-center p-6 text-center bg-card rounded-lg shadow-md">
          <p className="text-lg mb-4">No Xtream Codes credentials found</p>
          <p className="text-muted-foreground mb-6">
            Please load a playlist with Xtream Codes credentials to access movies
          </p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => navigate("/")}
          >
            Go to Playlist
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <NavBar 
        onLogout={() => {
          localStorage.removeItem("iptv-playlist");
          navigate("/");
        }}
      />
      
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Movies</h1>
        
        {selectedMovie ? (
          <div className="space-y-4">
            <button 
              onClick={() => setSelectedMovie(null)}
              className="btn-icon px-3 py-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back to Movies</span>
            </button>
            
            <div className="border rounded-lg overflow-hidden bg-card">
              <MovieDetails 
                movie={selectedMovie}
                onPlay={handlePlayMovie}
                isLoading={false}
              />
            </div>
          </div>
        ) : (
          <MovieList 
            movieCategories={movieCategories || null}
            selectedMovie={selectedMovie}
            onSelectMovie={handleSelectMovie}
            isLoading={isLoading}
          />
        )}
      </div>
    </>
  );
};

export default Movies;
