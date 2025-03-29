
import React, { useState } from "react";
import { Series } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import SeriesBanner from "./series/SeriesBanner";
import SeriesMetadata from "./series/SeriesMetadata";
import SeasonsList from "./series/SeasonsList";
import LoadSeasonsButton from "./series/LoadSeasonsButton";
import NoSeriesSelected from "./series/NoSeriesSelected";
import SeriesDetailsSkeleton from "./series/SeriesDetailsSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="h-full flex flex-col">
      <SeriesBanner series={series} />
      <SeriesMetadata series={series} />

      <ScrollArea className="flex-1 pr-4 mt-6 h-[calc(90vh-350px)]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-black/60 to-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/5 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Episodes</h3>
            {series.seasons && series.seasons.length > 0 && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {series.seasons.length} {series.seasons.length === 1 ? 'Season' : 'Seasons'}
              </Badge>
            )}
          </div>
          
          <AnimatePresence mode="wait">
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
          </AnimatePresence>
        </motion.div>
      </ScrollArea>
    </div>
  );
};

export default SeriesDetails;
