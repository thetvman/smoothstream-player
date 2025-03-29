
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
    <div className="flex flex-col max-h-[80vh] h-full">
      {/* Banner section with fixed height */}
      <div className="flex-shrink-0">
        <SeriesBanner series={series} />
      </div>
      
      {/* Scrollable content area for metadata and episodes */}
      <ScrollArea className="flex-1 pr-4">
        <div className="py-4">
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
