
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
    <div className="h-full flex flex-col">
      <SeriesBanner series={series} />
      <SeriesMetadata series={series} />

      <ScrollArea className="flex-1 pr-4 mt-6 h-[calc(90vh-350px)]">
        <EpisodeSection
          series={series}
          expandedSeason={expandedSeason}
          onSeasonClick={onSeasonClick}
          onPlayEpisode={onPlayEpisode}
          onLoadSeasons={onLoadSeasons}
        />
      </ScrollArea>
    </div>
  );
};

export default SeriesContent;
