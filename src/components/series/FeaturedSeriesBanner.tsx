
import React from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Tv, Star, CalendarIcon, Play } from "lucide-react";
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
      className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "450px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/60 to-transparent z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      
      {series.backdrop ? (
        <motion.img 
          src={series.backdrop} 
          alt={series.name}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1, filter: "brightness(0.6)" }}
          animate={{ scale: 1, filter: "brightness(0.8)" }}
          transition={{ duration: 8, ease: "easeOut" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      ) : series.logo ? (
        <div className="w-full h-full relative bg-gradient-to-br from-black via-[#0a0a14] to-black">
          <motion.img 
            src={series.logo} 
            alt={series.name}
            className="absolute inset-0 m-auto max-w-[60%] max-h-[60%] object-contain opacity-40"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.4, scale: 1 }}
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
      
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 py-8 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="flex flex-col md:flex-row items-start md:items-end gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <div className="relative w-28 h-40 rounded-lg overflow-hidden shadow-2xl hidden md:block">
              {series.logo ? (
                <img 
                  src={series.logo}
                  alt={series.name}
                  className="h-full w-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                  <Tv className="h-10 w-10 text-white/20" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {series.name}
              </motion.h2>
              
              <motion.div 
                className="flex flex-wrap gap-2 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
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
                  className="text-white/70 mb-4 line-clamp-2 text-sm md:text-base max-w-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {series.description}
                </motion.p>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-5 rounded-lg transition-all shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  onClick={handleViewDetails}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Now
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedSeriesBanner;
