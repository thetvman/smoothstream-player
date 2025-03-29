
import React from "react";
import { Season, Series, Episode } from "@/lib/types";
import { motion } from "framer-motion";
import SeasonItem from "./SeasonItem";

interface SeasonsListProps {
  seasons: Season[];
  onEpisodeClick: (episode: Episode) => void;
  series: Series;
  expandedSeason: string | null;
  onSeasonClick: (seasonId: string) => void;
}

const SeasonsList: React.FC<SeasonsListProps> = ({
  seasons,
  onEpisodeClick,
  expandedSeason,
  onSeasonClick
}) => {
  if (!seasons || seasons.length === 0) {
    return <p className="text-center py-8 text-white/50">No episodes available for this series</p>;
  }

  return (
    <div className="space-y-3">
      {seasons.map((season, index) => (
        <SeasonItem
          key={season.id}
          season={season}
          seasonIndex={index}
          isExpanded={expandedSeason === season.id}
          onSeasonClick={onSeasonClick}
          onEpisodeClick={onEpisodeClick}
        />
      ))}
    </div>
  );
};

export default SeasonsList;
