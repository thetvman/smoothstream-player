
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SeriesCategory, Series, PaginatedSeries } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import SeriesCarousel from "./SeriesCarousel";
import SeriesGridDisplay from "./SeriesGridDisplay";

interface SeriesContentAreaProps {
  isLoading: boolean;
  isAdvancedSearch: boolean;
  activeCategory: string | null;
  seriesCategories: SeriesCategory[] | null;
  featuredSeries: Series | null;
  paginatedSeries: PaginatedSeries;
  suggestedSeries: Series[];
  onSelectSeries: (series: Series) => void;
  onLoadSeasons: (series: Series) => void;
  onPageChange: (page: number) => void;
  setSelectedSeries: (series: Series | null) => void;
}

const SeriesContentArea: React.FC<SeriesContentAreaProps> = ({
  isLoading,
  isAdvancedSearch,
  activeCategory,
  seriesCategories,
  featuredSeries,
  paginatedSeries,
  suggestedSeries,
  onSelectSeries,
  onLoadSeasons,
  onPageChange,
  setSelectedSeries
}) => {
  // Get the current category name
  const getCurrentCategoryName = () => {
    if (isAdvancedSearch) return "Search Results";
    if (!activeCategory || !seriesCategories) return "All Series";
    
    const category = seriesCategories.find(cat => cat.id === activeCategory);
    return category?.name || "All Series";
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-[#0a0a15] to-black">
      <ScrollArea className="h-full">
        <div className="min-h-full p-6">
          {/* Recommended Series Carousel (when not searching) */}
          {!isAdvancedSearch && !isLoading && suggestedSeries.length > 0 && (
            <motion.div
              className="mb-12 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Recommended For You
              </h2>
              
              <SeriesCarousel 
                series={suggestedSeries} 
                onSelect={setSelectedSeries}
                onLoad={onLoadSeasons}
              />
            </motion.div>
          )}

          {/* Series Grid */}
          <motion.div 
            className="pb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                {getCurrentCategoryName()}
              </h2>
              {!isLoading && (
                <div className="text-sm text-white/60">
                  {paginatedSeries.totalItems} series available
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <Skeleton className="aspect-[2/3] w-full bg-white/5 rounded-xl" />
                    <Skeleton className="h-5 w-3/4 mt-3 bg-white/5 rounded-md" />
                    <Skeleton className="h-4 w-1/2 mt-2 bg-white/5 rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
              <SeriesGridDisplay
                paginatedSeries={paginatedSeries}
                onSelect={onSelectSeries}
                onLoad={onLoadSeasons}
                onPageChange={onPageChange}
              />
            )}
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SeriesContentArea;
