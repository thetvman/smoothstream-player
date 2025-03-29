
import React from "react";
import { Series } from "@/lib/types";
import { CalendarIcon, Star, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SeriesBannerProps {
  series: Series;
}

const SeriesBanner: React.FC<SeriesBannerProps> = ({ series }) => {
  return (
    <div className="relative mb-6 rounded-xl overflow-hidden h-64 bg-gradient-to-br from-gray-900 to-black shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
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
          className="w-full h-full object-contain p-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <Tv className="h-16 w-16 text-white/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end">
        <div className="p-4 text-white">
          <h2 className="text-2xl font-bold mb-2">{series.name}</h2>
          
          <div className="flex flex-wrap gap-2">
            {series.year && (
              <Badge className="bg-white/10 backdrop-blur-md border-none text-white">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {series.year}
              </Badge>
            )}
            {series.rating && (
              <Badge className="bg-white/10 backdrop-blur-md border-none text-white">
                <Star className="mr-1 h-3 w-3 text-yellow-400" />
                {series.rating}
              </Badge>
            )}
            {series.group && (
              <Badge className="bg-white/10 backdrop-blur-md border-none text-white">
                {series.group}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesBanner;
