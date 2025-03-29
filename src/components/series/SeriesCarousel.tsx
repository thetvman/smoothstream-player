
import React, { useState, useRef } from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeriesCarouselProps {
  series: Series[];
  onSelect: (series: Series) => void;
  onLoad: (series: Series) => void;
}

const SeriesCarousel: React.FC<SeriesCarouselProps> = ({
  series,
  onSelect,
  onLoad
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    
    const scrollAmount = 300;
    const newPosition = direction === "left" 
      ? Math.max(scrollPosition - scrollAmount, 0)
      : Math.min(
          scrollPosition + scrollAmount,
          carouselRef.current.scrollWidth - carouselRef.current.clientWidth
        );
    
    carouselRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth"
    });
    
    setScrollPosition(newPosition);
  };

  const handleSelectSeries = (series: Series) => {
    onSelect(series);
    onLoad(series);
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = carouselRef.current 
    ? scrollPosition < carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10
    : false;

  if (!series.length) return null;

  return (
    <div className="relative group">
      <div 
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-4"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {series.map((item, index) => (
          <motion.div
            key={item.id}
            className="flex-shrink-0 w-48 cursor-pointer group/item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              transition: { delay: index * 0.1, duration: 0.5 }
            }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleSelectSeries(item)}
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-black/40">
              {item.logo ? (
                <img 
                  src={item.logo} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <span className="text-white/20">{item.name.substring(0, 1)}</span>
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  variant="default" 
                  size="icon"
                  className="bg-primary/90 hover:bg-primary shadow-xl rounded-full"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <h3 className="font-medium text-sm truncate group-hover/item:text-primary transition-colors">
              {item.name}
            </h3>
            
            <div className="flex text-xs text-gray-400 gap-2 mt-1">
              {item.year && <span>{item.year}</span>}
              {item.rating && (
                <span className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" /> 
                  {item.rating}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Navigation arrows */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleScroll("left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}
      
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleScroll("right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default SeriesCarousel;
