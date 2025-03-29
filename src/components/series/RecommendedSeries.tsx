
import React from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Tv, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RecommendedSeriesProps {
  series: Series[];
  onSelect: (series: Series) => void;
  onLoad: (series: Series) => void;
}

const RecommendedSeries: React.FC<RecommendedSeriesProps> = ({ series, onSelect, onLoad }) => {
  if (!series || series.length === 0) return null;

  return (
    <motion.div 
      className="mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Recommended For You</h2>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs">
          See all
        </Button>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {series.map((series, index) => (
            <CarouselItem key={series.id} className="pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <motion.div 
                className="cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: 0.3 + (index * 0.05),
                    duration: 0.5
                  }
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                onClick={() => {
                  onSelect(series);
                  onLoad(series);
                }}
              >
                <div className="relative aspect-[2/3] rounded-md overflow-hidden mb-2 bg-black shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300">
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
                      <Tv className="h-10 w-10 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                    <motion.div 
                      className="bg-primary text-white p-2 rounded-full"
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Tv className="h-5 w-5" />
                    </motion.div>
                  </div>
                </div>
                <h3 className="font-medium text-xs truncate text-white">{series.name}</h3>
                <div className="flex text-xs text-gray-400 gap-2">
                  {series.year && <span className="text-xs">{series.year}</span>}
                  {series.rating && <span className="flex items-center text-xs"><Star className="h-3 w-3 text-yellow-500 mr-0.5" /> {series.rating}</span>}
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-1 w-6 h-6 bg-black/70 text-white hover:bg-black/90 border-none" />
        <CarouselNext className="right-1 w-6 h-6 bg-black/70 text-white hover:bg-black/90 border-none" />
      </Carousel>
    </motion.div>
  );
};

export default RecommendedSeries;
