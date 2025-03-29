
import React, { useState } from "react";
import { Series, Episode } from "@/lib/types";
import { motion } from "framer-motion";
import SeasonsList from "./SeasonsList";
import EpisodeDetails from "./EpisodeDetails";

interface EpisodeSectionProps {
  series: Series;
  expandedSeason: string | null;
  onSeasonClick: (seasonId: string) => void;
  onPlayEpisode: (episode: Episode, series: Series) => void;
  onLoadSeasons: () => void;
}

const EpisodeSection: React.FC<EpisodeSectionProps> = ({ 
  series, 
  expandedSeason, 
  onSeasonClick,
  onPlayEpisode,
  onLoadSeasons
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false);
  
  React.useEffect(() => {
    // Load seasons if they don't exist
    if (!series.seasons || series.seasons.length === 0) {
      onLoadSeasons();
    }
  }, [series, onLoadSeasons]);

  const handlePlayEpisode = (episode: Episode, series: Series) => {
    onPlayEpisode(episode, series);
  };

  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(episode);
    setEpisodeDialogOpen(true);
  };

  const handleCloseEpisodeDialog = () => {
    setEpisodeDialogOpen(false);
    setSelectedEpisode(null);
  };

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-lg font-bold mb-4 text-white">Episodes</h3>
      
      {!series.seasons || series.seasons.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-pulse">Loading episodes...</div>
        </div>
      ) : (
        <SeasonsList
          seasons={series.seasons}
          onPlayEpisode={handleEpisodeClick}
          series={series}
          expandedSeason={expandedSeason}
          onSeasonClick={onSeasonClick}
        />
      )}

      {/* Episode Details Dialog */}
      <EpisodeDetails 
        episode={selectedEpisode}
        series={series}
        isOpen={episodeDialogOpen}
        onClose={handleCloseEpisodeDialog}
        onPlay={handlePlayEpisode}
      />
    </motion.div>
  );
};

export default EpisodeSection;
