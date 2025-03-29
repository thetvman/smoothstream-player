
import React from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlayCircle, InfoIcon } from "lucide-react";

interface FeaturedSeriesHeroProps {
  series: Series;
  onSelectSeries: (series: Series) => void;
  onLoadSeasons: (series: Series) => void;
}

const FeaturedSeriesHero: React.FC<FeaturedSeriesHeroProps> = ({
  series,
  onSelectSeries,
  onLoadSeasons
}) => {
  // Handle click to view details
  const handleViewDetails = () => {
    onSelectSeries(series);
    onLoadSeasons(series);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden h-80 mb-4">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        {series.backdrop || series.logo ? (
          <img 
            src={series.backdrop || series.logo} 
            alt={series.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900/50 to-blue-900/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90">
            {series.name}
          </h1>
          
          <div className="flex items-center gap-3 mb-4">
            {series.year && <span className="bg-white/10 px-2 py-1 rounded text-sm">{series.year}</span>}
            {series.rating && (
              <span className="bg-white/10 px-2 py-1 rounded text-sm flex items-center">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {series.rating}
              </span>
            )}
            {series.genre && <span className="bg-white/10 px-2 py-1 rounded text-sm">{series.genre}</span>}
          </div>
          
          <p className="text-white/80 mb-6 line-clamp-2">
            {series.plot || "Watch this exciting series now!"}
          </p>
          
          <div className="flex gap-4">
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90 text-white gap-2"
              onClick={handleViewDetails}
            >
              <PlayCircle className="h-5 w-5" />
              Watch Now
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2"
              onClick={handleViewDetails}
            >
              <InfoIcon className="h-5 w-5" />
              More Info
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedSeriesHero;
