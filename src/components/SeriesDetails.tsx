
import React, { useState } from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import SeriesContent from "./series/SeriesContent";
import NoSeriesSelected from "./series/NoSeriesSelected";
import SeriesDetailsSkeleton from "./series/SeriesDetailsSkeleton";

interface SeriesDetailsProps {
  series: Series | null;
  onPlayEpisode: (episode: any, series: Series) => void;
  onLoadSeasons: (series: Series) => void;
  isLoading?: boolean;
}

const SeriesDetails: React.FC<SeriesDetailsProps> = ({ 
  series, 
  onPlayEpisode, 
  onLoadSeasons,
  isLoading = false 
}) => {
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  if (isLoading) {
    return <SeriesDetailsSkeleton />;
  }

  if (!series) {
    return <NoSeriesSelected />;
  }

  const handleLoadSeasons = () => {
    if (!series.seasons || series.seasons.length === 0) {
      onLoadSeasons(series);
    }
  };

  const handleSeasonClick = (seasonId: string) => {
    setExpandedSeason(expandedSeason === seasonId ? null : seasonId);
    if (!series.seasons || series.seasons.length === 0) {
      onLoadSeasons(series);
    }
  };

  return (
    <motion.div 
      className="h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SeriesContent
        series={series}
        expandedSeason={expandedSeason}
        onSeasonClick={handleSeasonClick}
        onPlayEpisode={onPlayEpisode}
        onLoadSeasons={handleLoadSeasons}
      />
    </motion.div>
  );
};

export default SeriesDetails;
