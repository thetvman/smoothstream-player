
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Series as SeriesType, XtreamCredentials } from "@/lib/types";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { safeJsonParse } from "@/lib/utils";
import { fetchAllSeries, fetchSeriesWithEpisodes, storeEpisodeForPlayback, clearOldSeriesData } from "@/lib/mediaService";
import { AdvancedSearchParams } from "@/components/AdvancedSearch";

// Import refactored components
import SeriesDetails from "@/components/SeriesDetails";
import FeaturedSeriesBanner from "@/components/series/FeaturedSeriesBanner";
import SeriesSidebar from "@/components/series/SeriesSidebar";
import SeriesGrid from "@/components/series/SeriesGrid";
import RecommendedSeries from "@/components/series/RecommendedSeries";
import NoCredentialsView from "@/components/series/NoCredentialsView";

const Series = () => {
  const navigate = useNavigate();
  const [selectedSeries, setSelectedSeries] = useState<SeriesType | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [featuredSeries, setFeaturedSeries] = useState<SeriesType | null>(null);
  const [searchParams, setSearchParams] = useState<AdvancedSearchParams>({
    title: "",
    genre: "",
    yearFrom: 1950,
    yearTo: new Date().getFullYear(),
    ratingMin: 0
  });
  const [filteredSeries, setFilteredSeries] = useState<SeriesType[]>([]);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  
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

  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !activeCategory) {
      setActiveCategory(seriesCategories[0].id);
    }
  }, [seriesCategories, activeCategory]);

  useEffect(() => {
    if (seriesCategories && seriesCategories.length > 0 && !featuredSeries) {
      const categoriesWithSeries = seriesCategories.filter(cat => cat.series.length > 0);
      if (categoriesWithSeries.length > 0) {
        const randomCategory = categoriesWithSeries[Math.floor(Math.random() * categoriesWithSeries.length)];
        if (randomCategory && randomCategory.series.length > 0) {
          const randomSeries = randomCategory.series[Math.floor(Math.random() * randomCategory.series.length)];
          setFeaturedSeries(randomSeries);
        }
      }
    }
  }, [seriesCategories, featuredSeries]);
  
  const handleSelectSeries = (series: SeriesType) => {
    setSelectedSeries(series);
  };
  
  useEffect(() => {
    clearOldSeriesData();
  }, []);
  
  const handleLoadSeasons = async (series: SeriesType) => {
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
  
  const handlePlayEpisode = (episode: any, series: SeriesType) => {
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

  const getSuggestedSeries = (): SeriesType[] => {
    if (!seriesCategories) return [];
    
    const allSeries: SeriesType[] = [];
    seriesCategories.forEach(category => {
      allSeries.push(...category.series);
    });
    
    const filteredSeries = allSeries.filter(series => series.id !== selectedSeries?.id);
    const shuffled = [...filteredSeries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  };

  const clearAdvancedSearch = () => {
    setIsAdvancedSearch(false);
    setQuickSearch("");
    setSearchParams({
      title: "",
      genre: "",
      yearFrom: 1950,
      yearTo: new Date().getFullYear(),
      ratingMin: 0
    });
  };

  const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setQuickSearch(searchTerm);
    
    if (!searchTerm.trim()) {
      setIsAdvancedSearch(false);
      return;
    }
    
    if (!seriesCategories) return;
    
    setIsAdvancedSearch(true);
    
    let results: SeriesType[] = [];
    seriesCategories.forEach(category => {
      results = [...results, ...category.series];
    });
    
    results = results.filter(series => 
      series.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredSeries(results);
  };

  const getCurrentSeries = (): SeriesType[] => {
    if (isAdvancedSearch) {
      return filteredSeries;
    } else if (activeCategory && seriesCategories) {
      const category = seriesCategories.find(cat => cat.id === activeCategory);
      return category?.series || [];
    }
    return [];
  };

  // Show no credentials view if no credentials found
  if (!credentials) {
    return <NoCredentialsView />;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <AnimatePresence>
        {featuredSeries && (
          <FeaturedSeriesBanner 
            series={featuredSeries} 
            onSelectSeries={setSelectedSeries}
            onLoadSeasons={handleLoadSeasons}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          <SeriesSidebar 
            seriesCategories={seriesCategories}
            activeCategory={activeCategory}
            isLoading={isLoading}
            isAdvancedSearch={isAdvancedSearch}
            quickSearch={quickSearch}
            filteredSeries={filteredSeries}
            onCategoryChange={handleCategoryChange}
            onQuickSearchChange={handleQuickSearch}
            clearAdvancedSearch={clearAdvancedSearch}
          />
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6">
            {!isAdvancedSearch && !isLoading && (
              <RecommendedSeries 
                series={getSuggestedSeries()} 
                onSelect={setSelectedSeries}
                onLoad={handleLoadSeasons}
              />
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">
                {isAdvancedSearch 
                  ? "Search Results" 
                  : (activeCategory && seriesCategories 
                      ? seriesCategories.find(cat => cat.id === activeCategory)?.name || "All Series"
                      : "All Series"
                    )
                }
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex flex-col">
                      <Skeleton className="h-40 w-full bg-white/5 rounded-xl" />
                      <Skeleton className="h-5 w-3/4 mt-3 bg-white/5 rounded-md" />
                      <Skeleton className="h-4 w-1/2 mt-2 bg-white/5 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <SeriesGrid
                  series={getCurrentSeries()}
                  onSelect={setSelectedSeries}
                  onLoad={handleLoadSeasons}
                />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedSeries && (
            <div 
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setSelectedSeries(null)}
            >
              <div 
                className="bg-black/90 w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 flex justify-between items-center border-b border-white/10">
                  <h2 className="text-xl font-bold">{selectedSeries.name}</h2>
                  <button 
                    onClick={() => setSelectedSeries(null)}
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors p-2"
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Series;
