
import React from "react";
import { Series, PaginatedSeries } from "@/lib/types";
import { motion } from "framer-motion";
import { Tv, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeriesPagination from "./SeriesPagination";

interface SeriesGridDisplayProps {
  paginatedSeries: PaginatedSeries;
  onSelect: (series: Series) => void;
  onLoad: (series: Series) => void;
  onPageChange: (page: number) => void;
}

const SeriesGridDisplay: React.FC<SeriesGridDisplayProps> = ({ 
  paginatedSeries, 
  onSelect, 
  onLoad,
  onPageChange 
}) => {
  const handleClick = (series: Series) => {
    onSelect(series);
    onLoad(series);
  };

  if (paginatedSeries.totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm rounded-2xl border border-white/5">
        <div className="rounded-full bg-black/30 p-6 mb-4">
          <Tv className="h-12 w-12 text-gray-400" />
        </div>
        <p className="text-xl font-medium text-white/80 mb-1">No series available</p>
        <p className="text-sm text-white/50">Try with a different search term or category</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col">
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {paginatedSeries.items.map((series) => (
          <motion.div 
            key={series.id} 
            className="cursor-pointer group"
            variants={item}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleClick(series)}
          >
            <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800/50 to-black rounded-xl overflow-hidden mb-3 shadow-lg border border-white/5 group-hover:border-primary/30 transition-all duration-300">
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
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <Tv className="h-12 w-12 text-white/20" />
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-primary/80 hover:bg-primary shadow-xl w-full gap-2"
                >
                  <Play className="h-4 w-4" />
                  Watch Now
                </Button>
              </div>
            </div>
            
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors duration-300">{series.name}</h3>
            
            <div className="flex text-xs text-gray-400 gap-2 mt-1">
              {series.year && <span>{series.year}</span>}
              {series.rating && (
                <span className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" /> 
                  {series.rating}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Pagination */}
      {paginatedSeries.totalPages > 1 && (
        <SeriesPagination 
          paginatedSeries={paginatedSeries} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
};

export default SeriesGridDisplay;
