
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Movie, MovieCategory, XtreamCredentials } from "@/lib/types";
import { fetchAllMovies, storeMovieForPlayback, clearOldMovieData } from "@/lib/mediaService";
import MovieList from "@/components/MovieList";
import MovieDetails from "@/components/MovieDetails";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/utils";
import NavBar from "@/components/NavBar";

const Movies = () => {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
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
  
  // Handle movie selection
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };
  
  // Clean up storage on component mount
  useEffect(() => {
    // Clear old movie data to free up space
    clearOldMovieData();
    
    // Remove the full movie list if it exists (we'll use individual storage now)
    if (localStorage.getItem("xtream-movies")) {
      localStorage.removeItem("xtream-movies");
      console.log("Removed full movie list from localStorage to save space");
    }
  }, []);
  
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
        
        {!credentials ? (
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
        ) : selectedMovie ? (
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
