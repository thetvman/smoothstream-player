
import React from "react";
import { Series } from "@/lib/types";
import { Tv } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SeriesSuggestionsProps {
  suggestions: Series[];
  onSelectSeries: (series: Series) => void;
}

const SeriesSuggestions: React.FC<SeriesSuggestionsProps> = ({ 
  suggestions,
  onSelectSeries,
}) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No suggestions available
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {suggestions.map((series) => (
          <CarouselItem key={series.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6">
            <div 
              className="p-1 cursor-pointer" 
              onClick={() => onSelectSeries(series)}
            >
              <div className="overflow-hidden rounded-md bg-gray-900 aspect-video relative group">
                {series.backdrop ? (
                  <img 
                    src={series.backdrop} 
                    alt={series.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : series.logo ? (
                  <img 
                    src={series.logo} 
                    alt={series.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-primary text-white p-2 rounded-full">
                    <Tv className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-sm truncate">{series.name}</h3>
                <div className="flex items-center text-xs text-gray-400 gap-2">
                  {series.year && <span>{series.year}</span>}
                  {series.rating && <span>⭐ {series.rating}</span>}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 bg-black/50 hover:bg-black/80" />
      <CarouselNext className="right-2 bg-black/50 hover:bg-black/80" />
    </Carousel>
  );
};

export default SeriesSuggestions;
