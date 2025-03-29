
import React from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface SeriesMetadataProps {
  series: Series;
}

const SeriesMetadata: React.FC<SeriesMetadataProps> = ({ series }) => {
  return (
    <>
      {series.genre && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium mb-2 text-white/70">Genre</h3>
          <div className="flex flex-wrap gap-2">
            {series.genre.split(',').map((genre, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-primary/10 hover:bg-primary/20 text-primary border-none"
              >
                {genre.trim()}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {series.description && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium mb-2 text-white/70">Description</h3>
          <p className="text-white/70 whitespace-normal break-words leading-relaxed">{series.description}</p>
        </motion.div>
      )}
    </>
  );
};

export default SeriesMetadata;
