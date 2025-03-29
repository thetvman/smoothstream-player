
import React from "react";
import { Series } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import SeriesBanner from "./SeriesBanner";
import SeriesMetadata from "./SeriesMetadata";
import EpisodeSection from "./EpisodeSection";

interface SeriesContentProps {
  series: Series;
  expandedSeason: string | null;
  onSeasonClick: (seasonId: string) => void;
  onPlayEpisode: (episode: any, series: Series) => void;
  onLoadSeasons: () => void;
}

const SeriesContent: React.FC<SeriesContentProps> = ({
  series,
  expandedSeason,
  onSeasonClick,
  onPlayEpisode,
  onLoadSeasons
}) => {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Banner section with fixed height */}
      <div className="flex-shrink-0">
        <SeriesBanner series={series} />
      </div>
      
      {/* Main content area with scrolling */}
      <ScrollArea className="flex-1 w-full">
        <div className="p-4">
          <SeriesMetadata series={series} />
          
          <EpisodeSection
            series={series}
            expandedSeason={expandedSeason}
            onSeasonClick={onSeasonClick}
            onPlayEpisode={onPlayEpisode}
            onLoadSeasons={onLoadSeasons}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default SeriesContent;
