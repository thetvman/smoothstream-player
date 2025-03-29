
import React from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Star, PlayCircle, CalendarIcon } from "lucide-react";

interface SeriesItemProps {
  series: Series;
  isSelected: boolean;
  onSelect: (series: Series) => void;
}

const SeriesItem: React.FC<SeriesItemProps> = ({
  series,
  isSelected,
  onSelect,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(series)}
      className={`relative rounded-lg overflow-hidden h-full flex flex-col bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm 
        ${isSelected ? "ring-2 ring-primary/70 shadow-lg shadow-primary/20" : "ring-1 ring-white/5"}
        transition-all duration-300 cursor-pointer group`}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {series.logo ? (
          <img
            src={series.logo}
            alt={series.name}
            className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
            <span className="text-sm text-white/30 font-light">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.1 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-primary text-white rounded-full p-1.5 shadow-lg"
            >
              <PlayCircle className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </div>
      <div className="p-2 flex-1 flex flex-col">
        <h3 className="font-medium text-xs group-hover:text-primary transition-colors duration-300 line-clamp-1">{series.name}</h3>
        <div className="flex flex-wrap gap-1.5 mt-1.5 text-xs">
          {series.year && (
            <div className="bg-white/10 text-white/70 px-1.5 py-0.5 rounded-md flex items-center text-[10px]">
              <CalendarIcon className="h-2.5 w-2.5 mr-0.5 text-white/50" />
              {series.year}
            </div>
          )}
          {series.rating && (
            <div className="bg-white/10 text-white/70 px-1.5 py-0.5 rounded-md flex items-center text-[10px]">
              <Star className="h-2.5 w-2.5 mr-0.5 text-yellow-400" />
              {series.rating}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SeriesItem;
