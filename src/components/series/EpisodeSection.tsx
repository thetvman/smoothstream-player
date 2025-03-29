
import React from "react";
import { Series } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import LoadSeasonsButton from "./LoadSeasonsButton";
import SeasonsList from "./SeasonsList";

interface EpisodeSectionProps {
  series: Series;
  expandedSeason: string | null;
  onSeasonClick: (seasonId: string) => void;
  onPlayEpisode: (episode: any, series: Series) => void;
  onLoadSeasons: () => void;
}

const EpisodeSection: React.FC<EpisodeSectionProps> = ({
  series,
  expandedSeason,
  onSeasonClick,
  onPlayEpisode,
  onLoadSeasons
}) => {
  return (
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
          <LoadSeasonsButton onLoadSeasons={onLoadSeasons} />
        ) : (
          <SeasonsList 
            seasons={series.seasons} 
            onPlayEpisode={onPlayEpisode} 
            series={series} 
            expandedSeason={expandedSeason} 
            onSeasonClick={onSeasonClick} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EpisodeSection;
