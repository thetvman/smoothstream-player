
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { storeEpisodeForPlayback } from "@/lib/mediaService";

// Import custom hook
import { useSeriesState } from "@/hooks/useSeriesState";

// Import components
import SeriesDetails from "@/components/SeriesDetails";
import SeriesSidebar from "@/components/series/SeriesSidebar";
import SeriesContentArea from "@/components/series/SeriesContentArea";
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
    <div className="flex flex-col h-screen bg-gradient-to-b from-black to-[#0a0a15] text-white overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
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

        <SeriesContentArea 
          isLoading={isLoading}
          isAdvancedSearch={isAdvancedSearch}
          activeCategory={activeCategory}
          seriesCategories={seriesCategories}
          featuredSeries={featuredSeries}
          paginatedSeries={paginatedSeries}
          suggestedSeries={getSuggestedSeries()}
          onSelectSeries={handleSelectSeries}
          onLoadSeasons={handleLoadSeasonsWithToast}
          onPageChange={handlePageChange}
          setSelectedSeries={setSelectedSeries}
        />

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
                <div className="overflow-hidden max-h-[calc(90vh-4rem)]">
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
