
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Movie, MovieCategory, XtreamCredentials } from "@/lib/types";
import { fetchAllMovies } from "@/lib/movieService";
import MovieList from "@/components/MovieList";
import MovieDetails from "@/components/MovieDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/utils";

const Movies = () => {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState<string>("browse");
  
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
    setActiveTab("details");
  };
  
  // Handle play button
  const handlePlayMovie = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl h-dvh flex flex-col">
      <div className="flex items-center mb-4 gap-4">
        <button 
          onClick={() => navigate("/")}
          className="btn-icon"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="ml-2">Back</span>
        </button>
        
        <h1 className="text-2xl font-bold">Movies</h1>
      </div>
      
      {!credentials ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <div className="md:col-span-1 h-[calc(100vh-8rem)]">
            <MovieList 
              movieCategories={movieCategories || null}
              selectedMovie={selectedMovie}
              onSelectMovie={handleSelectMovie}
              isLoading={isLoading}
            />
          </div>
          
          <div className="md:col-span-2 md:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">Browse</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browse" className="h-[calc(100vh-12rem)]">
                <MovieList 
                  movieCategories={movieCategories || null}
                  selectedMovie={selectedMovie}
                  onSelectMovie={handleSelectMovie}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="details" className="h-[calc(100vh-12rem)]">
                <MovieDetails 
                  movie={selectedMovie}
                  onPlay={handlePlayMovie}
                  isLoading={isLoading && !selectedMovie}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="hidden md:block md:col-span-2 border rounded-lg h-[calc(100vh-8rem)]">
            <MovieDetails 
              movie={selectedMovie}
              onPlay={handlePlayMovie}
              isLoading={isLoading && !selectedMovie}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
