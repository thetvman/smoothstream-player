
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { storeEpisodeForPlayback } from "@/lib/mediaService";

// Import custom hook
import { useSeriesState } from "@/hooks/useSeriesState";

// Import components
import SeriesDetails from "@/components/SeriesDetails";
import FeaturedSeriesBanner from "@/components/series/FeaturedSeriesBanner";
import SeriesSidebar from "@/components/series/SeriesSidebar";
import SeriesGrid from "@/components/series/SeriesGrid";
import RecommendedSeries from "@/components/series/RecommendedSeries";
import NoCredentialsView from "@/components/series/NoCredentialsView";

const Series = () => {
  const navigate = useNavigate();
  const { 
    seriesCategories,
    selectedSeries,
    activeCategory,
    featuredSeries,
    isLoading,
    error,
    filteredSeries,
    isAdvancedSearch,
    quickSearch,
    currentPage,
    credentials,
    getPaginatedSeries,
    handleSelectSeries,
    setSelectedSeries,
    handleLoadSeasons,
    handleCategoryChange,
    getSuggestedSeries,
    handleQuickSearch,
    clearAdvancedSearch,
    handlePageChange
  } = useSeriesState();
  
  // Handle error notifications
  useEffect(() => {
    if (error) {
      toast.error("Failed to load series: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }, [error]);
  
  // Handle episode playback
  const handlePlayEpisode = (episode: any, series: any) => {
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
  
  // Handle load seasons with toast notifications
  const handleLoadSeasonsWithToast = async (series: any) => {
    if (!credentials) {
      toast.error("No Xtream credentials found");
      return;
    }
    
    try {
      toast.info(`Loading seasons for ${series.name}...`);
      const updatedSeries = await handleLoadSeasons(series);
      
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

  // Get paginated series for the current view
  const paginatedSeries = getPaginatedSeries();

  // Show no credentials view if no credentials found
  if (!credentials) {
    return <NoCredentialsView />;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <AnimatePresence>
        {featuredSeries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FeaturedSeriesBanner 
              series={featuredSeries} 
              onSelectSeries={setSelectedSeries}
              onLoadSeasons={handleLoadSeasonsWithToast}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
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
          </motion.div>
        </AnimatePresence>

        <motion.div 
          className="flex-1 overflow-y-auto scrollbar-hide bg-gradient-to-b from-black to-[#0a0a10]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="p-4 pb-24">
            {!isAdvancedSearch && !isLoading && (
              <RecommendedSeries 
                series={getSuggestedSeries()} 
                onSelect={setSelectedSeries}
                onLoad={handleLoadSeasonsWithToast}
              />
            )}

            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  {isAdvancedSearch 
                    ? "Search Results" 
                    : (activeCategory && seriesCategories 
                        ? seriesCategories.find(cat => cat.id === activeCategory)?.name || "All Series"
                        : "All Series"
                      )
                  }
                </h2>
                <div className="text-sm text-white/60">
                  {paginatedSeries.totalItems} series available
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  paginatedSeries={paginatedSeries}
                  onSelect={handleSelectSeries}
                  onLoad={handleLoadSeasonsWithToast}
                  onPageChange={handlePageChange}
                />
              )}
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {selectedSeries && (
            <motion.div 
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedSeries(null)}
            >
              <motion.div 
                className="bg-gradient-to-b from-black/90 to-[#080810]/90 w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] border border-white/10"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="p-4 flex justify-between items-center border-b border-white/10">
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">{selectedSeries.name}</h2>
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
                    onLoadSeasons={handleLoadSeasonsWithToast}
                    isLoading={isLoading && !selectedSeries.seasons}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Series;
