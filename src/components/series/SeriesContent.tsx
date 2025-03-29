
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
    <div className="flex flex-col h-full max-h-[80vh] overflow-hidden">
      {/* Banner and metadata section with fixed height */}
      <div className="flex-shrink-0">
        <SeriesBanner series={series} />
        <SeriesMetadata series={series} />
      </div>

      {/* Episode section with flexible height and scrolling */}
      <div className="flex-1 mt-4 min-h-0">
        <ScrollArea className="h-full pr-4">
          <EpisodeSection
            series={series}
            expandedSeason={expandedSeason}
            onSeasonClick={onSeasonClick}
            onPlayEpisode={onPlayEpisode}
            onLoadSeasons={onLoadSeasons}
          />
        </ScrollArea>
      </div>
    </div>
  );
};

export default SeriesContent;
