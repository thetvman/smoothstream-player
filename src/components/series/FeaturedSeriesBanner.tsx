
import React from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Tv, Star, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FeaturedSeriesBannerProps {
  series: Series;
  onSelectSeries: (series: Series) => void;
  onLoadSeasons: (series: Series) => void;
}

const FeaturedSeriesBanner: React.FC<FeaturedSeriesBannerProps> = ({
  series,
  onSelectSeries,
  onLoadSeasons
}) => {
  if (!series) return null;

  const handleViewDetails = () => {
    onSelectSeries(series);
    onLoadSeasons(series);
  };

  return (
    <motion.div 
      className="relative w-full h-[40vh] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />
      
      {series.backdrop ? (
        <motion.img 
          src={series.backdrop} 
          alt={series.name}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      ) : series.logo ? (
        <div className="w-full h-full relative bg-gradient-to-br from-gray-900 to-black">
          <motion.img 
            src={series.logo} 
            alt={series.name}
            className="absolute inset-0 m-auto max-w-[80%] max-h-[80%] object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <Tv className="h-32 w-32 text-white/10" />
        </div>
      )}
      
      <motion.div 
        className="absolute bottom-0 left-0 p-6 z-20 max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <motion.h2 
          className="text-3xl font-bold mb-2 text-white/90"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {series.name}
        </motion.h2>
        
        <motion.div 
          className="flex flex-wrap gap-2 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          {series.year && (
            <Badge className="bg-white/10 backdrop-blur-md text-white border-none">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {series.year}
            </Badge>
          )}
          {series.rating && (
            <Badge className="bg-white/10 backdrop-blur-md text-white border-none">
              <Star className="mr-1 h-3 w-3 text-yellow-400" />
              {series.rating}
            </Badge>
          )}
          {series.genre && (
            <Badge className="bg-white/10 backdrop-blur-md text-white border-none">
              {series.genre.split(',')[0]}
            </Badge>
          )}
        </motion.div>
        
        {series.description && (
          <motion.p 
            className="text-white/70 mb-4 line-clamp-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {series.description}
          </motion.p>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <Button 
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-all shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            onClick={handleViewDetails}
          >
            <Tv className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FeaturedSeriesBanner;
