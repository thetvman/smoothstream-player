
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Series, SeriesCategory, Episode, XtreamCredentials } from "@/lib/types";
import { fetchAllSeries, fetchSeriesWithEpisodes, storeEpisodeForPlayback, clearOldSeriesData } from "@/lib/mediaService";
import SeriesList from "@/components/SeriesList";
import SeriesDetails from "@/components/SeriesDetails";
import SeriesSuggestions from "@/components/SeriesSuggestions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Film, Tv } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Series = () => {
  const navigate = useNavigate();
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [featuredSeries, setFeaturedSeries] = useState<Series | null>(null);
  
  const getCredentials = (): XtreamCredentials | null => {
    const playlist = localStorage.getItem("iptv-playlist");
    if (!playlist) return null;
    
    const parsedPlaylist = safeJsonParse(playlist, null);
    return parsedPlaylist?.credentials || null;
  };
  
  const credentials = getCredentials();
  
  const { data: seriesCategories, isLoading, error } = useQuery({
    queryKey: ["series", credentials?.server],
    queryFn: async () => {
      if (!credentials) {
        throw new Error("No Xtream credentials found");
      }
      return fetchAllSeries(credentials);
    },
    enabled: !!credentials,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  useEffect(() => {
    if (error) {
      toast.error("Failed to load series: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, [error]);

  // Set active category when series categories load
  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !activeCategory) {
      setActiveCategory(seriesCategories[0].id);
    }
  }, [seriesCategories, activeCategory]);

  // Select a random featured series when categories load
  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !featuredSeries) {
      // Find a category with series
      const categoriesWithSeries = seriesCategories.filter(cat => cat.series.length > 0);
      if (categoriesWithSeries.length > 0) {
        // Pick a random category
        const randomCategory = categoriesWithSeries[Math.floor(Math.random() * categoriesWithSeries.length)];
        // Pick a random series from that category
        const randomSeries = randomCategory.series[Math.floor(Math.random() * randomCategory.series.length)];
        setFeaturedSeries(randomSeries);
      }
    }
  }, [seriesCategories, featuredSeries]);
  
  const handleSelectSeries = (series: Series) => {
    setSelectedSeries(series);
    setActiveTab("details");
  };
  
  useEffect(() => {
    clearOldSeriesData();
  }, []);
  
  const handleLoadSeasons = async (series: Series) => {
    if (!credentials) {
      toast.error("No Xtream credentials found");
      return;
    }
    
    try {
      toast.info(`Loading seasons for ${series.name}...`);
      const updatedSeries = await fetchSeriesWithEpisodes(credentials, series);
      
      if (!updatedSeries.seasons || updatedSeries.seasons.length === 0) {
        toast.warning("No episodes found for this series");
      } else {
        setSelectedSeries(updatedSeries);
        toast.success(`Loaded ${updatedSeries.seasons.length} seasons`);
      }
    } catch (error) {
      console.error("Error loading series episodes:", error);
      toast.error("Failed to load episodes");
    }
  };
  
  const handlePlayEpisode = (episode: Episode, series: Series) => {
    if (!episode) {
      toast.error("No episode selected");
      return;
    }
    
    try {
      storeEpisodeForPlayback(episode, series);
      navigate(`/series/${series.id}/episode/${episode.id}`);
    } catch (error) {
      console.error("Error preparing episode for playback:", error);
      toast.error("Failed to prepare episode for playback");
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Get suggested series (from different categories than the selected series)
  const getSuggestedSeries = (): Series[] => {
    if (!seriesCategories) return [];
    
    const allSeries: Series[] = [];
    seriesCategories.forEach(category => {
      allSeries.push(...category.series);
    });
    
    // Get up to 10 random series, excluding the selected one
    const filteredSeries = allSeries.filter(series => series.id !== selectedSeries?.id);
    const shuffled = [...filteredSeries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  };
  
  if (!credentials) {
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
            
            <h1 className="text-2xl font-bold">TV Series</h1>
          </div>
          
          <button 
            onClick={() => navigate("/movies")}
            className="btn-icon"
          >
            <Film className="w-5 h-5" />
            <span className="ml-2">Movies</span>
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
          <p className="text-lg mb-4">No Xtream Codes credentials found</p>
          <p className="text-muted-foreground mb-6">
            Please load a playlist with Xtream Codes credentials to access series
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
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Featured Banner */}
      {featuredSeries && (
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>
          {featuredSeries.backdrop ? (
            <img 
              src={featuredSeries.backdrop} 
              alt={featuredSeries.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          ) : featuredSeries.logo ? (
            <img 
              src={featuredSeries.logo} 
              alt={featuredSeries.name}
              className="w-full h-full object-contain p-4 bg-gray-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <Tv className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 p-6 z-20">
            <h2 className="text-3xl font-bold mb-2">{featuredSeries.name}</h2>
            <div className="flex gap-2 mb-4">
              {featuredSeries.year && (
                <span className="bg-white/20 px-2 py-1 rounded text-sm">{featuredSeries.year}</span>
              )}
              {featuredSeries.rating && (
                <span className="bg-white/20 px-2 py-1 rounded text-sm">⭐ {featuredSeries.rating}</span>
              )}
            </div>
            <button 
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
              onClick={() => {
                setSelectedSeries(featuredSeries);
                handleLoadSeasons(featuredSeries);
              }}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-800 bg-black h-full flex-shrink-0 overflow-y-auto">
          <div>
            <div className="flex items-center mb-6 p-4">
              <button 
                onClick={() => navigate("/")}
                className="mr-2 p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold">TV Series</h2>
            </div>

            <div className="px-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full bg-gray-800" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {seriesCategories?.map((category) => (
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
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Series Suggestions Carousel */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Suggested Series</h2>
              <SeriesSuggestions 
                suggestions={getSuggestedSeries()} 
                onSelectSeries={(series) => {
                  setSelectedSeries(series);
                  handleLoadSeasons(series);
                }} 
              />
            </div>

            {/* Series Grid */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">
                {activeCategory && seriesCategories 
                  ? seriesCategories.find(cat => cat.id === activeCategory)?.name || "All Series"
                  : "All Series"
                }
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex flex-col">
                      <Skeleton className="h-40 w-full bg-gray-800 rounded-md" />
                      <Skeleton className="h-5 w-3/4 mt-2 bg-gray-800" />
                      <Skeleton className="h-4 w-1/2 mt-1 bg-gray-800" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {activeCategory && seriesCategories 
                    ? seriesCategories
                        .find(cat => cat.id === activeCategory)
                        ?.series.map(series => (
                          <div 
                            key={series.id} 
                            className="cursor-pointer group"
                            onClick={() => {
                              setSelectedSeries(series);
                              handleLoadSeasons(series);
                            }}
                          >
                            <div className="relative aspect-[2/3] bg-gray-900 rounded-md overflow-hidden mb-2">
                              {series.logo ? (
                                <img 
                                  src={series.logo} 
                                  alt={series.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Tv className="h-10 w-10 text-muted-foreground" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="bg-primary text-white p-2 rounded-full">
                                  <Tv className="h-6 w-6" />
                                </button>
                              </div>
                            </div>
                            <h3 className="font-medium text-sm truncate">{series.name}</h3>
                            <div className="flex text-xs text-gray-400 gap-2">
                              {series.year && <span>{series.year}</span>}
                              {series.rating && <span>⭐ {series.rating}</span>}
                            </div>
                          </div>
                        ))
                    : <p className="text-gray-400">Select a category to view series</p>
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Series Details Modal */}
        {selectedSeries && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-900 w-full max-w-4xl rounded-lg shadow-xl overflow-hidden max-h-[90vh]">
              <div className="p-4 flex justify-between items-center border-b border-gray-800">
                <h2 className="text-xl font-bold">{selectedSeries.name}</h2>
                <button 
                  onClick={() => setSelectedSeries(null)}
                  className="p-1 hover:bg-gray-800 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
                <SeriesDetails 
                  series={selectedSeries}
                  onPlayEpisode={handlePlayEpisode}
                  onLoadSeasons={handleLoadSeasons}
                  isLoading={isLoading && !selectedSeries.seasons}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Series;
