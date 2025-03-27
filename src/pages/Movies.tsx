
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tv } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Channel, Playlist } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { Link } from "react-router-dom";

const Movies = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<Channel[]>([]);

  // Load movies from the saved playlist
  useEffect(() => {
    setIsLoading(true);
    
    // Get saved playlist from localStorage
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    if (savedPlaylist) {
      const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
      
      if (parsedPlaylist) {
        // Filter channels that have movie-related group names
        const movieChannels = parsedPlaylist.channels.filter(channel => {
          const group = channel.group?.toLowerCase() || "";
          return (
            group.includes("movie") || 
            group.includes("film") || 
            group.includes("cinema") ||
            group.includes("vod")
          );
        });
        
        setMovies(movieChannels);
      }
    }
    
    setIsLoading(false);
  }, []);

  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col h-full space-y-6">
        <header className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Movies</h1>
          <p className="text-muted-foreground">Browse and watch your movie collection</p>
        </header>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-[200px] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((movie) => (
              <Link 
                to={`/player/${movie.id}`}
                key={movie.id}
                className="group flex flex-col overflow-hidden border rounded-lg transition-all hover:shadow-md"
              >
                <div className="relative aspect-video bg-muted">
                  {movie.logo ? (
                    <img 
                      src={movie.logo} 
                      alt={movie.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Tv className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 w-full">
                      <span className="px-2 py-1 bg-primary/80 text-white text-xs rounded-full">
                        Play
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-medium line-clamp-1">{movie.name}</h3>
                  {movie.group && (
                    <p className="text-xs text-muted-foreground mt-1">{movie.group}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <Tv className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Movies Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Your movie collection will appear here after you load a playlist containing movies.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Movies;
