import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Film } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Channel, Playlist, XtreamCredentials, PaginatedChannels } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const TvSeries = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tvSeries, setTvSeries] = useState<Channel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedSeries, setPaginatedSeries] = useState<PaginatedChannels | null>(null);

  // Load TV series from the saved playlist
  useEffect(() => {
    const loadTvSeries = async () => {
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
        
        // If playlist is from Xtream, attempt to get series categories
        if (parsedPlaylist.source === "xtream" && parsedPlaylist.credentials) {
          await fetchXtreamSeries(parsedPlaylist);
        } else {
          // Regular M3U playlist - filter by keywords
          const seriesChannels = parsedPlaylist.channels.filter(channel => {
            const group = channel.group?.toLowerCase() || "";
            return (
              group.includes("series") || 
              group.includes("tv") || 
              group.includes("show") ||
              group.includes("entertainment")
            );
          });
          
          setTvSeries(seriesChannels);
        }
      } catch (error) {
        console.error("Error loading TV series:", error);
        toast.error("Failed to load TV series");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTvSeries();
  }, []);
  
  // Update paginated series when the full list or page changes
  useEffect(() => {
    setPaginatedSeries(paginateChannels(tvSeries, currentPage, ITEMS_PER_PAGE));
  }, [tvSeries, currentPage]);
  
  // Fetch series from Xtream API
  const fetchXtreamSeries = async (playlist: Playlist) => {
    if (!playlist.credentials) return;
    
    const { server, username, password } = playlist.credentials as XtreamCredentials;
    
    try {
      // Get series categories
      const seriesCategoriesUrl = `${server}/player_api.php?username=${username}&password=${password}&action=get_series_categories`;
      const categoriesResponse = await fetch(seriesCategoriesUrl);
      const categories = await categoriesResponse.json();
      
      if (!Array.isArray(categories)) {
        throw new Error("Invalid response from Xtream server");
      }
      
      // Get series
      const seriesUrl = `${server}/player_api.php?username=${username}&password=${password}&action=get_series`;
      const seriesResponse = await fetch(seriesUrl);
      const seriesData = await seriesResponse.json();
      
      if (!Array.isArray(seriesData)) {
        throw new Error("Invalid response from Xtream server");
      }
      
      // Create a map of category IDs to names
      const categoryMap: Record<string, string> = {};
      categories.forEach((cat: any) => {
        if (cat.category_id && cat.category_name) {
          categoryMap[cat.category_id] = cat.category_name;
        }
      });
      
      // Create series channels directly from API response
      const seriesChannels: Channel[] = seriesData.map((series: any) => {
        return {
          id: `series-${series.series_id}`,
          name: series.name || `Series ${series.series_id}`,
          // URL will be constructed in Player component when needed
          url: `${server}/series/${username}/${password}/${series.series_id}`,
          logo: series.cover || series.backdrop_path || undefined,
          group: series.category_id ? categoryMap[series.category_id] : "TV Series",
          stream_type: "series",
          epg_channel_id: series.series_id.toString()
        };
      });
      
      setTvSeries(seriesChannels);
    } catch (error) {
      console.error("Error fetching Xtream series:", error);
      
      // Fallback to keyword filtering if Xtream API calls fail
      const seriesChannels = playlist.channels.filter(channel => {
        const group = channel.group?.toLowerCase() || "";
        return (
          group.includes("series") || 
          group.includes("tv") || 
          group.includes("show") ||
          group.includes("entertainment")
        );
      });
      
      setTvSeries(seriesChannels);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Generate pagination links
  const renderPaginationLinks = () => {
    if (!paginatedSeries || paginatedSeries.totalPages <= 1) return null;
    
    const { currentPage, totalPages } = paginatedSeries;
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
          <h1 className="text-2xl font-bold tracking-tight">TV Series</h1>
          <p className="text-muted-foreground">Browse and watch your favorite TV shows</p>
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
        ) : tvSeries.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedSeries?.items.map((series) => (
                <Link 
                  to={`/player/${series.id}`}
                  key={series.id}
                  className="group flex flex-col overflow-hidden border rounded-lg transition-all hover:shadow-md"
                >
                  <div className="relative aspect-video bg-muted">
                    {series.logo ? (
                      <img 
                        src={series.logo} 
                        alt={series.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Film className="h-12 w-12 text-muted-foreground" />
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
                    <h3 className="font-medium line-clamp-1">{series.name}</h3>
                    {series.group && (
                      <p className="text-xs text-muted-foreground mt-1">{series.group}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            {paginatedSeries && paginatedSeries.totalPages > 1 && (
              <div className="py-4 flex flex-col items-center">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                      </PaginationItem>
                    )}
                    
                    {renderPaginationLinks()}
                    
                    {currentPage < paginatedSeries.totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
                
                <div className="text-xs text-center text-muted-foreground mt-2">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, paginatedSeries.totalItems)} of {paginatedSeries.totalItems} series
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <Film className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No TV Series Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Your TV series collection will appear here after you load a playlist containing TV shows.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TvSeries;
