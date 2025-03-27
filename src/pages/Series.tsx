
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Series, Season, Episode, SeriesCategory } from "@/lib/types";
import { storeEpisodeForPlayback, clearOldSeriesData } from "@/lib/mediaService";
import SeriesList from "@/components/SeriesList";
import SeriesDetails from "@/components/SeriesDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Film, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { 
  getTVShowsByCategory, 
  getTVShowDetails, 
  getTVSeasonDetails,
  searchTVShows 
} from "@/lib/tmdbService";

const SeriesPage = () => {
  const navigate = useNavigate();
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [seriesCategories, setSeriesCategories] = useState<SeriesCategory[]>([]);
  
  // Fetch popular series
  const { isLoading: isLoadingPopular } = useQuery({
    queryKey: ["series", "popular"],
    queryFn: async () => {
      const popularSeries = await getTVShowsByCategory("Popular");
      
      if (popularSeries.length > 0) {
        setSeriesCategories(prev => {
          const exists = prev.some(cat => cat.name === "Popular");
          if (exists) {
            return prev.map(cat => 
              cat.name === "Popular" ? { ...cat, series: popularSeries } : cat
            );
          } else {
            return [...prev, { id: "popular", name: "Popular", series: popularSeries }];
          }
        });
      }
      
      return popularSeries;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch top rated series
  const { isLoading: isLoadingTopRated } = useQuery({
    queryKey: ["series", "top-rated"],
    queryFn: async () => {
      const topRatedSeries = await getTVShowsByCategory("Top Rated");
      
      if (topRatedSeries.length > 0) {
        setSeriesCategories(prev => {
          const exists = prev.some(cat => cat.name === "Top Rated");
          if (exists) {
            return prev.map(cat => 
              cat.name === "Top Rated" ? { ...cat, series: topRatedSeries } : cat
            );
          } else {
            return [...prev, { id: "top-rated", name: "Top Rated", series: topRatedSeries }];
          }
        });
      }
      
      return topRatedSeries;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch on the air series
  const { isLoading: isLoadingOnAir } = useQuery({
    queryKey: ["series", "on-the-air"],
    queryFn: async () => {
      const onAirSeries = await getTVShowsByCategory("On The Air");
      
      if (onAirSeries.length > 0) {
        setSeriesCategories(prev => {
          const exists = prev.some(cat => cat.name === "On The Air");
          if (exists) {
            return prev.map(cat => 
              cat.name === "On The Air" ? { ...cat, series: onAirSeries } : cat
            );
          } else {
            return [...prev, { id: "on-the-air", name: "On The Air", series: onAirSeries }];
          }
        });
      }
      
      return onAirSeries;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Search series
  const { refetch: searchSeriesRefetch, isLoading: isSearching } = useQuery({
    queryKey: ["series", "search", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      const results = await searchTVShows(searchQuery);
      
      if (results.length > 0) {
        setSeriesCategories(prev => {
          const exists = prev.some(cat => cat.name === "Search Results");
          if (exists) {
            return prev.map(cat => 
              cat.name === "Search Results" ? { ...cat, series: results } : cat
            );
          } else {
            return [...prev, { id: "search-results", name: "Search Results", series: results }];
          }
        });
      }
      
      return results;
    },
    enabled: false, // Don't run automatically
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  
  // Fetch series details
  const { refetch: fetchSeriesDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["series-details", selectedSeries?.id],
    queryFn: async () => {
      if (selectedSeries?.tmdb_id) {
        const details = await getTVShowDetails(selectedSeries.tmdb_id);
        if (details) {
          setSelectedSeries(details);
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
        searchSeriesRefetch();
      }, 500); // Debounce
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchSeriesRefetch]);
  
  // Effect to fetch details when series is selected
  useEffect(() => {
    if (selectedSeries?.tmdb_id) {
      fetchSeriesDetails();
    }
  }, [selectedSeries?.id]); // Only run when the ID changes
  
  // Clean up storage on component mount
  useEffect(() => {
    clearOldSeriesData();
  }, []);
  
  const handleSelectSeries = (series: Series) => {
    setSelectedSeries(series);
    setActiveTab("details");
  };
  
  const handleLoadSeasons = async (series: Series) => {
    try {
      if (!series.tmdb_id) {
        toast.error("No TMDB ID found for this series");
        return;
      }
      
      toast.info(`Loading seasons for ${series.name}...`);
      
      // Load all seasons (up to 5 for now to avoid rate limiting)
      const seasons: Season[] = [];
      const seasonsCount = series.seasons_count || 1;
      const maxSeasonsToLoad = Math.min(seasonsCount, 5);
      
      for (let i = 1; i <= maxSeasonsToLoad; i++) {
        const season = await getTVSeasonDetails(series.tmdb_id, i);
        if (season) {
          seasons.push(season);
        }
      }
      
      if (seasons.length === 0) {
        toast.warning("No seasons found for this series");
        return;
      }
      
      // Update the selected series with seasons
      setSelectedSeries(prev => {
        if (prev) {
          return { ...prev, seasons };
        }
        return prev;
      });
      
      toast.success(`Loaded ${seasons.length} seasons`);
    } catch (error) {
      console.error("Error loading series seasons:", error);
      toast.error("Failed to load seasons");
    }
  };
  
  const handlePlayEpisode = (episode: Episode, series: Series) => {
    if (!episode) {
      toast.error("No episode selected");
      return;
    }
    
    // For TMDB episodes without a URL, show a message
    if (!episode.url) {
      toast.info("This is a TMDB preview. Please load your IPTV playlist to stream episodes.");
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
  
  const isLoading = isLoadingPopular || isLoadingTopRated || isLoadingOnAir;
  
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
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            className="pl-9"
            placeholder="Search TV series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-1 h-[calc(100vh-12rem)]">
          <SeriesList 
            seriesCategories={seriesCategories}
            selectedSeries={selectedSeries}
            onSelectSeries={handleSelectSeries}
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
              <SeriesList 
                seriesCategories={seriesCategories}
                selectedSeries={selectedSeries}
                onSelectSeries={handleSelectSeries}
                isLoading={isLoading || isSearching}
              />
            </TabsContent>
            
            <TabsContent value="details" className="h-[calc(100vh-16rem)]">
              <SeriesDetails 
                series={selectedSeries}
                onPlayEpisode={handlePlayEpisode}
                onLoadSeasons={handleLoadSeasons}
                isLoading={isLoadingDetails && !!selectedSeries}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="hidden md:block md:col-span-2 border rounded-lg h-[calc(100vh-12rem)]">
          <SeriesDetails 
            series={selectedSeries}
            onPlayEpisode={handlePlayEpisode}
            onLoadSeasons={handleLoadSeasons}
            isLoading={isLoadingDetails && !!selectedSeries}
          />
        </div>
      </div>
    </div>
  );
};

export default SeriesPage;
