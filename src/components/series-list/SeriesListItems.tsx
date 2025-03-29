
import React from "react";
import { Series } from "@/lib/types";
import SeriesItem from "./SeriesItem";
import SeriesListSkeleton from "./SeriesListSkeleton";
import { motion } from "framer-motion";

interface SeriesListItemsProps {
  items: Series[];
  selectedSeries: Series | null;
  onSelectSeries: (series: Series) => void;
  isLoading: boolean;
  searchQuery: string;
}

const SeriesListItems: React.FC<SeriesListItemsProps> = ({
  items,
  selectedSeries,
  onSelectSeries,
  isLoading,
  searchQuery,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (isLoading) {
    return <SeriesListSkeleton />;
  }

  if (!items.length) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm rounded-2xl border border-white/5"
      >
        <div className="rounded-full bg-black/30 p-6 mb-4">
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <p className="text-xl font-medium text-white/80 mb-1">
          {searchQuery ? "No series match your search" : "No series available"}
        </p>
        <p className="text-sm text-white/50">
          {searchQuery ? "Try with a different search term" : "Check back later for updates"}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
    >
      {items.map(series => (
        <motion.div key={series.id} variants={item}>
          <SeriesItem
            series={series}
            isSelected={selectedSeries?.id === series.id}
            onSelect={onSelectSeries}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SeriesListItems;
