
import React from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Tv, Star, PlayCircle } from "lucide-react";
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
      className="mb-8 pt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
        Recommended For You
      </h2>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {series.slice(0, 8).map((series, index) => (
            <CarouselItem key={series.id} className="pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <motion.div 
                className="cursor-pointer group relative"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 0.1 + (index * 0.05) }
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelect(series);
                  onLoad(series);
                }}
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-black/20 relative shadow-lg shadow-black/30">
                  {series.logo ? (
                    <img 
                      src={series.logo} 
                      alt={series.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <Tv className="h-10 w-10 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-primary rounded-full p-3 shadow-xl"
                    >
                      <PlayCircle className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-sm text-white/90 truncate group-hover:text-primary transition-colors duration-300">{series.name}</h3>
                  <div className="flex text-xs text-white/60 gap-2 mt-1">
                    {series.year && <span>{series.year}</span>}
                    {series.rating && <span className="flex items-center"><Star className="h-3 w-3 text-yellow-400 mr-0.5" /> {series.rating}</span>}
                  </div>
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 -translate-y-1/2 bg-black/70 text-white hover:bg-black border-none w-8 h-8" />
        <CarouselNext className="right-2 -translate-y-1/2 bg-black/70 text-white hover:bg-black border-none w-8 h-8" />
      </Carousel>
    </motion.div>
  );
};

export default RecommendedSeries;
