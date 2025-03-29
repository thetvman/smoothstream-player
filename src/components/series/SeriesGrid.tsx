
import React from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Tv, Star } from "lucide-react";

interface SeriesGridProps {
  series: Series[];
  onSelect: (series: Series) => void;
  onLoad: (series: Series) => void;
}

const SeriesGrid: React.FC<SeriesGridProps> = ({ series, onSelect, onLoad }) => {
  if (series.length === 0) {
    return <p className="text-gray-400 mt-4">No series match your criteria</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {series.map((series, index) => (
        <motion.div 
          key={series.id} 
          className="cursor-pointer group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              delay: index * 0.05,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
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
          <div className="relative aspect-[2/3] bg-black rounded-xl overflow-hidden mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
              <motion.div 
                className="bg-primary text-white p-2 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Tv className="h-6 w-6" />
              </motion.div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-sm truncate text-white group-hover:text-primary transition-colors duration-300">{series.name}</h3>
            <div className="flex text-xs text-gray-400 gap-2">
              {series.year && <span>{series.year}</span>}
              {series.rating && <span className="flex items-center"><Star className="h-3 w-3 text-yellow-500 mr-0.5" /> {series.rating}</span>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SeriesGrid;
