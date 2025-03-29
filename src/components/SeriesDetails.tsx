
import React, { useState } from "react";
import { Series } from "@/lib/types";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import SeriesBanner from "./series/SeriesBanner";
import SeriesMetadata from "./series/SeriesMetadata";
import SeasonsList from "./series/SeasonsList";
import LoadSeasonsButton from "./series/LoadSeasonsButton";
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
    <div className="p-6 h-full flex flex-col">
      <SeriesBanner series={series} />
      <SeriesMetadata series={series} />

      <div className="mt-4 flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Episodes</h3>
            {series.seasons && series.seasons.length > 0 && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {series.seasons.length} Seasons
              </Badge>
            )}
          </div>
          
          {!series.seasons ? (
            <LoadSeasonsButton onLoadSeasons={handleLoadSeasons} />
          ) : (
            <SeasonsList 
              seasons={series.seasons} 
              onPlayEpisode={onPlayEpisode} 
              series={series} 
              expandedSeason={expandedSeason} 
              onSeasonClick={handleSeasonClick} 
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SeriesDetails;
