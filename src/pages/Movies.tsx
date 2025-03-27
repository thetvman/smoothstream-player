import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tv } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Channel, Playlist, XtreamCredentials, PaginatedChannels } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Movies = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<Channel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedMovies, setPaginatedMovies] = useState<PaginatedChannels | null>(null);

  // Load movies from the saved playlist
  useEffect(() => {
    const loadMovies = async () => {
      setIsLoading(true);
      
      try {
        // Get saved playlist from localStorage
        const savedPlaylist = localStorage.getItem("iptv-playlist");
        if (!savedPlaylist) {
          setIsLoading(false);
          return;
        }
        
        const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
        if (!parsedPlaylist) {
          setIsLoading(false);
          return;
        }
        
        // If playlist is from Xtream, attempt to get VOD/movie categories
        if (parsedPlaylist.source === "xtream" && parsedPlaylist.credentials) {
          await fetchXtreamMovies(parsedPlaylist);
        } else {
          // Regular M3U playlist - filter by keywords
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
      } catch (error) {
        console.error("Error loading movies:", error);
        toast.error("Failed to load movies");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMovies();
  }, []);
  
  // Update paginated movies when the full list or page changes
  useEffect(() => {
    setPaginatedMovies(paginateChannels(movies, currentPage, ITEMS_PER_PAGE));
  }, [movies, currentPage]);
  
  // Fetch movies from Xtream API
  const fetchXtreamMovies = async (playlist: Playlist) => {
    if (!playlist.credentials) return;
    
    const { server, username, password } = playlist.credentials as XtreamCredentials;
    
    try {
      // Get VOD categories
      const vodCategoriesUrl = `${server}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`;
      const categoriesResponse = await fetch(vodCategoriesUrl);
      const categories = await categoriesResponse.json();
      
      if (!Array.isArray(categories)) {
        throw new Error("Invalid response from Xtream server");
      }
      
      // Get VOD streams
      const vodStreamsUrl = `${server}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`;
      const streamsResponse = await fetch(vodStreamsUrl);
      const streams = await streamsResponse.json();
      
      if (!Array.isArray(streams)) {
        throw new Error("Invalid response from Xtream server");
      }
      
      // Create a map of category IDs to names
      const categoryMap: Record<string, string> = {};
      categories.forEach((cat: any) => {
        if (cat.category_id && cat.category_name) {
          categoryMap[cat.category_id] = cat.category_name;
        }
      });
      
      // Create movie channels from VOD streams
      const movieChannels: Channel[] = streams.map((stream: any) => {
        return {
          id: `vod-${stream.stream_id}`,
          name: stream.name || `Movie ${stream.stream_id}`,
          // Not setting direct URL, it will be constructed in Player component when needed
          url: `${server}/movie/${username}/${password}/${stream.stream_id}.mp4`,
          logo: stream.stream_icon || undefined,
          group: stream.category_id ? categoryMap[stream.category_id] : "Movies",
          stream_type: "mp4"
        };
      });
      
      setMovies(movieChannels);
    } catch (error) {
      console.error("Error fetching Xtream movies:", error);
      
      // Fallback to keyword filtering if Xtream API calls fail
      const movieChannels = playlist.channels.filter(channel => {
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
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Generate pagination links
  const renderPaginationLinks = () => {
    if (!paginatedMovies || paginatedMovies.totalPages <= 1) return null;
    
    const { currentPage, totalPages } = paginatedMovies;
    const pageItems = [];
    
    // Add current page and surrounding pages
    const pageRange = 2;
    const startPage = Math.max(1, currentPage - pageRange);
    const endPage = Math.min(totalPages, currentPage + pageRange);
    
    if (startPage > 1) {
      pageItems.push(
        <PaginationItem key="page-1">
          <PaginationLink isActive={currentPage === 1} onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        pageItems.push(
          <PaginationItem key="ellipsis-1">
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink isActive={currentPage === i} onClick={() => handlePageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageItems.push(
          <PaginationItem key="ellipsis-2">
            <span className="flex h-9 w-9 items-center justify-center">...</span>
          </PaginationItem>
        );
      }
      
      pageItems.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink isActive={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pageItems;
  };

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedMovies?.items.map((movie) => (
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
            
            {paginatedMovies && paginatedMovies.totalPages > 1 && (
              <div className="py-4 flex flex-col items-center">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                      </PaginationItem>
                    )}
                    
                    {renderPaginationLinks()}
                    
                    {currentPage < paginatedMovies.totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
                
                <div className="text-xs text-center text-muted-foreground mt-2">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, paginatedMovies.totalItems)} of {paginatedMovies.totalItems} movies
                </div>
              </div>
            )}
          </>
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
